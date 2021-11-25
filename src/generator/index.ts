import { DMMF } from "@prisma/generator-helper"
import path from "path"
import { Project, StructureKind } from "ts-morph"
import { SemicolonPreference } from "typescript"
import { generateEnum } from "./enum"
import { generateFilters } from "./filters"
import { generateGeneratedTypes } from "./generatedTypes"
import { generateModel } from "./model"
import { generateModelCommon } from "./model_common"
import { GeneratorContext } from "./types"

export async function generateAndEmit(
  dmmf: DMMF.Document,
  outputPath: string,
  prismaClientPath: string
) {
  const relativePrismaClientPath = path.relative(outputPath, prismaClientPath)

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      declaration: true,
      sourceMap: false,
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      types: [relativePrismaClientPath],
    },
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
          namespaceImport: "NPCLib",
          moduleSpecifier: "../generator/runtime",
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

  generateFilters(sourceFile, context)
  generateModelCommon(sourceFile, context)
  enums.forEach((modelEnum) => generateEnum(sourceFile, modelEnum, context))
  models.forEach((model) => generateModel(sourceFile, model, context))

  // This must be the last generated thing
  generateGeneratedTypes(sourceFile, context.getTypes())

  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
    semicolons: SemicolonPreference.Remove,
  })

  await project.save()
  await project.emit()

  // Remove source files to prevent typescript from trying to recompile it
  project.getSourceFiles().forEach((file) => file.deleteImmediatelySync())
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
