import * as PrismaInternals from "@prisma/internals"
import { execFileSync } from "child_process"
import * as fs from "fs-jetpack"
import * as Path from "path"
import * as ts from "typescript"
import { generateAndEmit } from "../../src/generator"
import { toInstalledPrismaSyntax } from "../__helpers__/prismaSchemaCompat"

/**
 * `typecheck.test.ts` and `readme-check.test.ts` type-check a consumer
 * snippet in isolation, without ever building a real Nexus schema — so a
 * resolver's `args` parameter gets whatever type TypeScript can infer
 * locally from the field builder, not the type Nexus's own typegen would
 * actually assign it once a real schema is built. That gap let a real bug
 * through: scalar/enum *list* fields (e.g. `roles Role[]`, `tags String[]`)
 * get a `WhereInput` filter shaped like `{ equals: T[], has: T, hasEvery,
 * hasSome, isEmpty }` in Prisma, but nexus-prisma-crud generated the
 * single-value filter (`{ equals: T, lt, lte, gt, gte, in, notIn, not }`)
 * for them too, since `getFieldDefinitionsForWhere` didn't check
 * `field.isList`. Both call sites individually looked fine — the mismatch
 * only shows up once Nexus's typegen has computed the *real* args shape
 * for a field that references a list-scalar/enum `WhereInput`.
 *
 * This test builds and runs an actual Nexus schema (via
 * `generateSchema.withArtifacts`, the same API Nexus's own test suite uses)
 * to get real typegen output, then type-checks the standard
 * `resolve: (root, args, ctx) => XCRUD.queryListResolver(root, { ...args },
 * ctx)` pattern against it — the only way to catch this class of bug.
 */
it("queryListResolver's args stay assignable once real Nexus typegen is involved", async () => {
  const rootDir = Path.join(__dirname, "..", "..")
  const schemaPath = Path.join(__dirname, "schema.prisma")
  const rawSchema = await fs.readAsync(schemaPath)

  if (!rawSchema) {
    throw new Error(`Unable to read fixture schema at "${schemaPath}".`)
  }

  const schema = toInstalledPrismaSyntax(rawSchema)

  const dir = Path.join(
    rootDir,
    ".e2e-tmp",
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
  fs.dir(dir)
  const tmpSchemaPath = Path.posix.join(dir, "schema.prisma")
  const prismaClientPath = Path.posix.join(dir, "./client")
  const dirOut = Path.posix.join(dir, "./crud")

  try {
    await fs.writeAsync(tmpSchemaPath, schema)

    execFileSync(
      process.execPath,
      [
        require.resolve("prisma/build/index.js"),
        "generate",
        "--schema",
        tmpSchemaPath,
      ],
      {
        cwd: rootDir,
        stdio: "pipe",
        env: { ...process.env, PRISMA_GENERATE_SKIP_AUTOINSTALL: "true" },
      }
    )

    const dmmf = await PrismaInternals.getDMMF({ datamodel: schema })
    await generateAndEmit(dmmf, dirOut, prismaClientPath)

    // Transpile the generated index.ts to plain JS so it can actually be
    // `require`d and executed below (it's TS-only output, meant to be
    // compiled by the consumer's own build).
    const generatedTsPath = Path.posix.join(dirOut, "index.ts")
    const generatedTsSource = (await fs.readAsync(generatedTsPath))!
    const transpiled = ts.transpileModule(generatedTsSource, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2018,
        esModuleInterop: true,
      },
    })
    await fs.writeAsync(
      Path.posix.join(dirOut, "index.js"),
      transpiled.outputText
    )

    // Symlink this package into the tmp dir's own node_modules, so a plain
    // `require("nexus-prisma-crud")` resolves exactly like it would for a
    // real consumer who installed it.
    const nodeModulesDir = Path.posix.join(dir, "node_modules")
    fs.dir(nodeModulesDir)
    fs.symlink(rootDir, Path.posix.join(nodeModulesDir, "nexus-prisma-crud"))

    // `User` has both a scalar list field (`tags String[]`) and an enum
    // list field (`roles Role[]`) — the two shapes affected by this bug —
    // plus a relation, to also exercise the WhereInput fan-out through it.
    const runnerSource = `
const { objectType, queryType } = require("nexus")
const { generateSchema } = require("nexus/dist/makeSchema")
const {
  UserCRUD,
  UserWhereInputType,
  ClientWhereInputType,
  ContactWhereInputType,
  nexusPrismaCrudPlugin,
} = require("./crud/index")

const UserType = objectType({
  name: "User",
  definition(t) {
    t.field(UserCRUD.Model.id)
    t.field(UserCRUD.Model.username)
    t.field(UserCRUD.Model.roles)
    t.field(UserCRUD.Model.tags)
  },
})

const Query = queryType({
  definition(t) {
    t.field(UserCRUD.queryList())
  },
})

generateSchema
  .withArtifacts(
    {
      types: [
        Query,
        UserType,
        UserWhereInputType,
        ClientWhereInputType,
        ContactWhereInputType,
      ],
      plugins: [
        nexusPrismaCrudPlugin({ getPrismaClient: (ctx) => ctx.prisma }),
      ],
      outputs: false,
      shouldExitAfterGenerateArtifacts: false,
    },
    __dirname + "/nexus-typegen.ts"
  )
  .then(({ tsTypes }) => {
    require("fs").writeFileSync(__dirname + "/nexus-typegen.d.ts", tsTypes)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
`
    const runnerPath = Path.posix.join(dir, "run.js")
    await fs.writeAsync(runnerPath, runnerSource)

    execFileSync(process.execPath, [runnerPath], {
      cwd: dir,
      stdio: "pipe",
    })

    // The standard usage pattern this package's own README documents:
    // spread the resolver's own `args` straight into `queryListResolver`.
    const consumerSource = `
import { queryType } from "nexus"
import { UserCRUD } from "./crud/index"

const Query = queryType({
  definition(t) {
    t.field(
      UserCRUD.queryList({
        resolve: async (root, args, ctx) => {
          return UserCRUD.queryListResolver(root, { ...args }, ctx)
        },
      })
    )
  },
})
`
    await fs.writeAsync(Path.posix.join(dir, "consumer.ts"), consumerSource)

    const nexusDir = Path.dirname(require.resolve("nexus/package.json"))
    const graphqlDir = Path.dirname(require.resolve("graphql/package.json"))

    const program = ts.createProgram({
      rootNames: [
        Path.posix.join(dirOut, "index.ts"),
        Path.posix.join(dir, "consumer.ts"),
        Path.posix.join(dir, "nexus-typegen.d.ts"),
      ],
      options: {
        target: ts.ScriptTarget.ES2018,
        lib: ["lib.es2018.d.ts"],
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        noEmit: true,
        baseUrl: rootDir,
        paths: {
          "nexus-prisma-crud": [Path.join(rootDir, "src", "index.ts")],
          nexus: [nexusDir],
          graphql: [graphqlDir],
        },
      },
    })

    const errors = ts
      .getPreEmitDiagnostics(program)
      .filter((d) => d.category === ts.DiagnosticCategory.Error)

    if (errors.length > 0) {
      const message = ts.formatDiagnosticsWithColorAndContext(errors, {
        getCurrentDirectory: () => dir,
        getCanonicalFileName: (f) => f,
        getNewLine: () => "\n",
      })
      throw new Error(message)
    }
  } finally {
    fs.remove(dir)
  }
}, 60000)
