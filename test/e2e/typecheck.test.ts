import * as PrismaInternals from "@prisma/internals"
import { execFileSync } from "child_process"
import * as fs from "fs-jetpack"
import * as Path from "path"
import * as ts from "typescript"
import { generateAndEmit } from "../../src/generator"

/**
 * This test exercises the whole pipeline against a *real* Prisma Client,
 * instead of just snapshotting the generated source text: it runs the actual
 * `prisma generate` CLI (the same one a consumer of this package would run),
 * feeds its DMMF into our generator, and then type-checks the emitted code
 * with the TypeScript compiler API against the real generated client types.
 *
 * This is what catches breakage caused by a new major version of Prisma
 * changing its generated client types (e.g. `Prisma.XxxCreateArgs`), which a
 * plain source snapshot can't: ts-morph's `project.emit()` doesn't fail on
 * type errors, and the snapshot test never resolves against a real client.
 */
it("generates code that type-checks against a real, generated Prisma Client", async () => {
  const rootDir = Path.join(__dirname, "..", "..")
  const schemaPath = Path.join(__dirname, "schema.prisma")
  const schema = await fs.readAsync(schemaPath)

  if (!schema) {
    throw new Error(`Unable to read fixture schema at "${schemaPath}".`)
  }

  // Generated inside the repo (rather than the OS temp dir) so that Node
  // module resolution walking up from the fixture finds this repo's
  // `node_modules` (in particular `@prisma/client`, which the `prisma
  // generate` CLI needs to resolve on its own).
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

    // Generate a real Prisma Client, exactly like a consumer would.
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
        // We are already invoking the exact, locally installed Prisma CLI
        // directly, so there is no need for Prisma to try to detect/install a
        // CLI version on its own (which would hit the network).
        env: { ...process.env, PRISMA_GENERATE_SKIP_AUTOINSTALL: "true" },
      }
    )

    const dmmf = await PrismaInternals.getDMMF({ datamodel: schema })

    await generateAndEmit(dmmf, dirOut, prismaClientPath, true)

    const nexusDir = Path.dirname(require.resolve("nexus/package.json"))
    const graphqlDir = Path.dirname(require.resolve("graphql/package.json"))

    const program = ts.createProgram({
      rootNames: [Path.posix.join(dirOut, "index.ts")],
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
