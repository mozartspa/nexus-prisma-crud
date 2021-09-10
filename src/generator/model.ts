import { DMMF } from "@prisma/generator-helper"
import { SourceFile, VariableDeclarationKind } from "ts-morph"
import { GeneratorContext } from "./types"

export function generateModel(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  //const whereUniqueInputTypeName = `${model.name}WhereUniqueInput`
  //const whereInputName = `${model.name}Where`
  //const whereInputTypeName = `${model.name}WhereInput`
  //const orderByInputTypeName = `${model.name}OrderByInput`
  //const modelRelationFilterName = `${model.name}RelationFilterInput`
  //const modelListRelationFilterName = `${model.name}ListRelationFilterInput`

  generateWhere(sourceFile, model, context)
}

export function generateWhere(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  const whereDefName = `${model.name}Where`
  const whereInputTypeName = `${model.name}WhereInput`

  // Fields definition
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${whereDefName}`,
        initializer(writer) {
          writer
            .inlineBlock(() => {
              writer.writeLine(`$name: '${whereInputTypeName}',`)
              model.fields.forEach((field) => {
                writer.write(`${field.name}:`)
                writer.inlineBlock(() => {
                  writer.writeLine(`name: '${field.name}',`)
                  if (field.kind === "scalar") {
                    if (field.name === "id" || field.name.endsWith("Id")) {
                      writer.writeLine(`type: 'IDFilterInput',`)
                    } else {
                      writer.writeLine(`type: '${field.type}FilterInput',`)
                    }
                  }
                })
                writer.write(",").newLine()
              })

              writer.write(`AND:`)
              writer.inlineBlock(() => {
                writer.writeLine(`name: 'AND',`)
                writer.writeLine(`type: list('${whereInputTypeName}'),`)
              })
              writer.write(",").newLine()

              writer.write(`OR:`)
              writer.inlineBlock(() => {
                writer.writeLine(`name: 'OR',`)
                writer.writeLine(`type: list('${whereInputTypeName}'),`)
              })
              writer.write(",").newLine()

              writer.write(`NOT:`)
              writer.inlineBlock(() => {
                writer.writeLine(`name: 'NOT',`)
                writer.writeLine(`type: list('${whereInputTypeName}'),`)
              })
              writer.write(",").newLine()
            })
            .newLine()
        },
      },
    ],
  })

  // Input Type
  context.addType(whereInputTypeName, `${whereInputTypeName}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${whereInputTypeName}Type`,
        initializer(writer) {
          writer.writeLine(`buildInputTypeFromFields(${whereDefName})`)
        },
      },
    ],
  })
}
