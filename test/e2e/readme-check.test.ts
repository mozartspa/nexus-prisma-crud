import * as PrismaInternals from "@prisma/internals"
import { execFileSync } from "child_process"
import * as fs from "fs-jetpack"
import * as Path from "path"
import * as ts from "typescript"
import { generateAndEmit } from "../../src/generator"

it("README usage examples type-check against a real, generated Prisma Client", async () => {
  const rootDir = Path.join(__dirname, "..", "..")
  const schemaPath = Path.join(__dirname, "schema.prisma")
  const schema = await fs.readAsync(schemaPath)
  if (!schema) throw new Error("no schema")

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

    const consumerSource = `
import { makeSchema, objectType, queryType, mutationType } from "nexus"
import {
  nexusPrismaCrudPlugin,
  UserCRUD,
  UserWhereInputType,
  ClientCRUD,
  ClientWhereInputType,
  ContactCRUD,
  ContactWhereInputType,
} from "./index"

export const UserType = objectType({
  name: "User",
  definition(t) {
    t.field(UserCRUD.Model.id)
    t.field(UserCRUD.Model.username)
    t.field(UserCRUD.Model.name)
    t.field(UserCRUD.Model.role)
  },
})

export const ClientType = objectType({
  name: "Client",
  definition(t) {
    t.field(ClientCRUD.Model.id)
    t.field(ClientCRUD.Model.name)
    t.field(ClientCRUD.Model.user)
    t.field(ClientCRUD.Model.contacts)
  },
})

export const ContactType = objectType({
  name: "Contact",
  definition(t) {
    t.field(ContactCRUD.Model.id)
    t.field(ContactCRUD.Model.name)
    t.field(ContactCRUD.Model.client)
  },
})

const Query = queryType({
  definition(t) {
    t.field(UserCRUD.queryOne())
    t.field(
      UserCRUD.queryList({
        name: "activeUsers",
        where: { exclude: { username: true } },
        resolve: async (root, args, ctx) => {
          return UserCRUD.queryListResolver(root, args, ctx)
        },
      })
    )
  },
})

const Mutation = mutationType({
  definition(t) {
    t.field(UserCRUD.mutationCreate())
    t.field(
      UserCRUD.mutationUpdate({
        input: { include: { name: true } },
      })
    )
    t.field(UserCRUD.mutationDelete())
  },
})

UserCRUD.whereInputType({
  extraDefinition(t) {
    t.string("usernameContainsCI")
  },
})

UserCRUD.createInputType({
  exclude: { role: true },
})

export const schema = makeSchema({
  outputs: false,
  types: [
    Query,
    Mutation,
    UserType,
    UserCRUD,
    UserWhereInputType,
    ClientType,
    ClientCRUD,
    ClientWhereInputType,
    ContactType,
    ContactCRUD,
    ContactWhereInputType,
  ],
  plugins: [
    nexusPrismaCrudPlugin({
      getPrismaClient: (ctx: any) => ctx.prisma,
    }),
  ],
})
`
    await fs.writeAsync(Path.posix.join(dirOut, "consumer.ts"), consumerSource)

    const nexusDir = Path.dirname(require.resolve("nexus/package.json"))
    const graphqlDir = Path.dirname(require.resolve("graphql/package.json"))

    const program = ts.createProgram({
      rootNames: [
        Path.posix.join(dirOut, "index.ts"),
        Path.posix.join(dirOut, "consumer.ts"),
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
        getCurrentDirectory: () => dirOut,
        getCanonicalFileName: (f) => f,
        getNewLine: () => "\n",
      })
      throw new Error(message)
    }
  } finally {
    fs.remove(dir)
  }
}, 60000)
