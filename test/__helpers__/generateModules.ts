import * as PrismaSDK from "@prisma/sdk"
import * as fs from "fs-jetpack"
import * as Path from "path"
import { generateAndEmit } from "../../src/generator"

export type GenerateModulesOutput = {
  js: string
  tsDeclaration: string
  tsSource: string
}

export async function generateModules(
  prismaDatamodel: string
): Promise<GenerateModulesOutput> {
  const dir = fs.tmpDir().cwd()
  const dirRelativePrismaClientOutput = "./client"
  const prismaClientPath = Path.posix.join(dir, dirRelativePrismaClientOutput)
  const dirOut = Path.posix.join(dir, "./crud")

  const dmmf = await PrismaSDK.getDMMF({
    datamodel: prismaDatamodel,
  })

  await generateAndEmit(dmmf, dirOut, prismaClientPath)

  async function readFile(file: string) {
    return (await fs.readAsync(Path.posix.join(dirOut, file))) || ""
  }

  const js = await readFile("./index.js")
  const tsDeclaration = await readFile("./index.d.ts")
  const tsSource = await readFile("./index.ts")

  return {
    js,
    tsDeclaration,
    tsSource,
  }
}
