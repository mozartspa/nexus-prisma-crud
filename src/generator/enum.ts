import { DMMF } from "@prisma/generator-helper"
import { SourceFile, VariableDeclarationKind } from "ts-morph"
import { asString, renderObject } from "./helpers/render"
import { GeneratorContext } from "./types"

export function generateEnum(
  sourceFile: SourceFile,
  modelEnum: DMMF.DatamodelEnum,
  context: GeneratorContext
) {
  // Enum
  context.addType(modelEnum.name, `${modelEnum.name}Enum`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${modelEnum.name}Enum`,
        initializer(writer) {
          writer
            .write("enumType(")
            .indent(1)
            .inlineBlock(() => {
              const members = modelEnum.values.reduce((acc, value) => {
                acc[value.name] = asString(value.name)
                return acc
              }, {} as any)

              writer.writeLine(`name: '${modelEnum.name}',`)
              writer.writeLine(`members: ${renderObject(members)}`)
            })
            .write(")")
            .newLine()
        },
      },
    ],
  })

  // Enum filter
  context.addType(
    `${modelEnum.name}EnumFilterInput`,
    `${modelEnum.name}EnumFilterInputType`
  )
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${modelEnum.name}EnumFilterInputType`,
        initializer(writer) {
          writer
            .write("inputObjectType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: '${`${modelEnum.name}EnumFilterInput`}',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(
                  `t.nullable.field('equals', { type: '${modelEnum.name}' as any })`
                )
                writer.writeLine(
                  `t.nullable.list.field('in', { type: '${modelEnum.name}' as any })`
                )
                writer.writeLine(
                  `t.nullable.list.field('notIn', { type: '${modelEnum.name}' as any })`
                )
              })
            })
            .write(")")
            .newLine()
        },
      },
    ],
  })
}
