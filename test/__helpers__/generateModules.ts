import * as PrismaInternals from "@prisma/internals"
import * as fs from "fs-jetpack"
import * as Path from "path"
import { generateAndEmit } from "../../src/generator"
import { toInstalledPrismaSyntax } from "./prismaSchemaCompat"

export type GenerateModulesOutput = {
  tsSource: string
}

// A `datasource` block must be present in order to resolve the DMMF (e.g.
// without one, types like `Decimal` are rejected as unsupported by the
// connector). Tests only care about the models/enums and never connect to a
// database, so `url` is a throwaway value, adjusted for whichever Prisma
// major is installed (see `prismaSchemaCompat`).
const datasource = toInstalledPrismaSyntax(`
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
`)

export async function generateModules(
  prismaDatamodel: string
): Promise<GenerateModulesOutput> {
  const dir = fs.tmpDir().cwd()
  const dirRelativePrismaClientOutput = "./client"
  const prismaClientPath = Path.posix.join(dir, dirRelativePrismaClientOutput)
  const dirOut = Path.posix.join(dir, "./crud")

  const dmmf = await PrismaInternals.getDMMF({
    datamodel: datasource + prismaDatamodel,
  })

  await generateAndEmit(dmmf, dirOut, prismaClientPath)

  const tsSource =
    (await fs.readAsync(Path.posix.join(dirOut, "./index.ts"))) || ""

  fs.remove(dir)

  return {
    tsSource,
  }
}
