import { DMMF } from "@prisma/generator-helper"
import { Project, StructureKind } from "ts-morph"
import { SemicolonPreference } from "typescript"
import { generateFilters } from "./filters"
import { generateGeneratedTypes } from "./generatedTypes"
import { generateModel } from "./model"
import { GeneratorContext } from "./types"

export async function generateAndEmit(dmmf: DMMF.Document, outputPath: string) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      declaration: true,
    },
  })

  const context = createGeneratorContext()
  //const enums = dmmf.datamodel.enums
  const models = dmmf.datamodel.models

  const sourceFile = project.createSourceFile(
    `${outputPath}/index.ts`,
    {
      statements: [
        {
          kind: StructureKind.ImportDeclaration,
          namedImports: ["enumType", "inputObjectType", "list"],
          moduleSpecifier: "nexus",
        },
        {
          kind: StructureKind.ImportDeclaration,
          namedImports: ["buildInputTypeFromFields", "createInputTypeBuilder"],
          moduleSpecifier: "../generator/runtime",
        },
      ],
    },
    {
      overwrite: true,
    }
  )

  generateFilters(sourceFile, context)
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