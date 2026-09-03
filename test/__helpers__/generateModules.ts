import * as PrismaInternals from "@prisma/internals"
import * as fs from "fs-jetpack"
import * as Path from "path"
import { generateAndEmit } from "../../src/generator"

export type GenerateModulesOutput = {
  tsSource: string
}

// Prisma 6 requires a `datasource` block to be present in order to resolve the
// DMMF (e.g. without one, types like `Decimal` are rejected as unsupported by
// the connector). Tests only care about the models/enums, so a datasource is
// prepended automatically instead of having to repeat it in every fixture.
const datasource = `
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
`

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
