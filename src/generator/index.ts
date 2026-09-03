import { DMMF } from "@prisma/generator-helper"
import path from "path"
import { Project, StructureKind } from "ts-morph"
import { SemicolonPreference } from "typescript"
import { generateEnum } from "./enum"
import { generateFilters } from "./filters"
import { generateGeneratedTypes } from "./generatedTypes"
import { VirtualSourceFile } from "./helpers/virtualSourceFile"
import { generateModel } from "./model"
import { generateModelCommon } from "./model_common"
import { generatePlugin, generateRuntimeContext } from "./plugin"
import { GeneratorContext } from "./types"

function getRelativePrismaClientPath(
  outputPath: string,
  prismaClientPath: string
) {
  let relativePath = path.relative(outputPath, prismaClientPath)

  // Replace `@prisma/client` with `.prisma/client/index` in order to target a specific file
  // instead of a package, otherwise when there are multiple packages of `prisma` in the same
  // project some build issues may arise (TS thinks that the packages with same name has same content).
  relativePath = relativePath.replace(
    "/@prisma/client",
    "/.prisma/client/index"
  )

  return relativePath
}

export async function generateAndEmit(
  dmmf: DMMF.Document,
  outputPath: string,
  prismaClientPath: string
) {
  const relativePrismaClientPath = getRelativePrismaClientPath(
    outputPath,
    prismaClientPath
  )

  // Only TypeScript source is generated: the consuming project's own
  // TypeScript compiler is the one that resolves the resolvers' types
  // against the Prisma Client it generated (e.g. `PrismaLib.User`).
  //
  // Pre-compiling to .js/.d.ts here used to be done for the sake of plain
  // JavaScript consumers, but it requires ts-morph to *print* those complex,
  // generic Prisma Client types back out as text. Recent Prisma Client
  // versions build their model types out of nested conditional/mapped types
  // (`$Result.GetResult<...>`) that TypeScript cannot always print back as a
  // named reference; when it can't, it falls back to inlining an expanded
  // structural type, and that expansion has been observed to silently drop
  // the nullability of scalar fields. Handing the .ts source to the
  // consumer's own compiler avoids that print/re-parse round-trip entirely,
  // since the type is never serialized to text in the first place.
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
  })

  const context = createGeneratorContext()
  const enums = dmmf.datamodel.enums
  const models = dmmf.datamodel.models

  const sourceFile = project.createSourceFile(
    `${outputPath}/index.ts`,
    {
      statements: [
        {
          kind: StructureKind.ImportDeclaration,
          namedImports: [
            "enumType",
            "inputObjectType",
            "objectType",
            "list",
            "nonNull",
            "nullable",
            "arg",
          ],
          moduleSpecifier: "nexus",
        },
        {
          kind: StructureKind.ImportDeclaration,
          namedImports: ["Runtime as NPCLib"],
          moduleSpecifier: "nexus-prisma-crud",
        },
        {
          kind: StructureKind.ImportDeclaration,
          namespaceImport: "PrismaLib",
          moduleSpecifier: relativePrismaClientPath,
        },
      ],
    },
    {
      overwrite: true,
    }
  )

  generateRuntimeContext(sourceFile, context)
  generateFilters(sourceFile, context)
  generateModelCommon(sourceFile, context)
  enums.forEach((modelEnum) => generateEnum(sourceFile, modelEnum, context))

  const vSourceFile = new VirtualSourceFile()
  models.forEach((model) => generateModel(vSourceFile, model, context))
  vSourceFile.applyToSource(sourceFile)

  generateGeneratedTypes(sourceFile, context.getTypes())
  generatePlugin(sourceFile, context)

  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
    semicolons: SemicolonPreference.Remove,
  })

  await project.save()
}

function createGeneratorContext() {
  let types: Record<string, string> = {}

  const context: GeneratorContext = {
    addType(typeName, typeObjectName) {
      types[typeName] = typeObjectName
    },
  }

  return Object.assign(context, {
    getTypes() {
      return types
    },
  })
}
