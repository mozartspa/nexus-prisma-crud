import { DMMF } from "@prisma/generator-helper"
import { Project, StructureKind } from "ts-morph"
import { SemicolonPreference } from "typescript"
import { generateFilters } from "./filters"
import { generateGeneratedTypes } from "./generatedTypes"
import { GeneratorContext } from "./types"

export async function generateAndEmit(
  _dmmf: DMMF.Document,
  outputPath: string
) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      declaration: true,
    },
  })

  //const enums = dmmf.datamodel.enums
  //const models = dmmf.datamodel.models

  const context = createGeneratorContext()

  const sourceFile = project.createSourceFile(
    `${outputPath}/index.ts`,
    {
      statements: [
        {
          kind: StructureKind.ImportDeclaration,
          namedImports: ["enumType", "inputObjectType"],
          moduleSpecifier: "nexus",
        },
      ],
    },
    {
      overwrite: true,
    }
  )

  generateFilters(sourceFile, context)
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
