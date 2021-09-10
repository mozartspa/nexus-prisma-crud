import { SourceFile, VariableDeclarationKind } from "ts-morph"
import { GeneratorContext } from "./types"

export function generateFilters(
  sourceFile: SourceFile,
  context: GeneratorContext
) {
  context.addType("SortDir", "SortDirEnum")
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "SortDirEnum",
        initializer(writer) {
          writer
            .write("enumType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: 'SortDir',`)
              writer.writeLine(`members: {"asc": "asc", "desc": "desc"}`)
            })
            .write(")")
            .newLine()
        },
      },
    ],
  })

  context.addType("IDFilterInput", "IDFilterInputType")
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "IDFilterInputType",
        initializer(writer) {
          writer
            .write("inputObjectType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: 'IDFilterInput',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(`t.id('equals')`)
                writer.writeLine(`t.list.id('in')`)
                writer.writeLine(`t.list.id('notIn')`)
                writer.writeLine(`t.id('lt')`)
                writer.writeLine(`t.id('lte')`)
                writer.writeLine(`t.id('gt')`)
                writer.writeLine(`t.id('gte')`)
                writer.writeLine(`t.field('not', { type: 'IDFilterInput' })`)
              })
            })
            .write(")")
            .newLine()
        },
      },
    ],
  })

  context.addType("StringFilterInput", "StringFilterInputType")
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "StringFilterInputType",
        initializer(writer) {
          writer
            .write("inputObjectType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: 'StringFilterInput',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(`t.string('equals')`)
                writer.writeLine(`t.string('contains')`)
                writer.writeLine(`t.string('startsWith')`)
                writer.writeLine(`t.string('endsWith')`)
                writer.writeLine(`t.list.string('in')`)
                writer.writeLine(`t.list.string('notIn')`)
                writer.writeLine(`t.string('lt')`)
                writer.writeLine(`t.string('lte')`)
                writer.writeLine(`t.string('gt')`)
                writer.writeLine(`t.string('gte')`)
                writer.writeLine(
                  `t.field('not', { type: 'StringFilterInput' })`
                )
              })
            })
            .write(")")
            .newLine()
        },
      },
    ],
  })

  context.addType("IntFilterInput", "IntFilterInputType")
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "IntFilterInputType",
        initializer(writer) {
          writer
            .write("inputObjectType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: 'IntFilterInput',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(`t.int('equals')`)
                writer.writeLine(`t.list.int('in')`)
                writer.writeLine(`t.list.int('notIn')`)
                writer.writeLine(`t.int('lt')`)
                writer.writeLine(`t.int('lte')`)
                writer.writeLine(`t.int('gt')`)
                writer.writeLine(`t.int('gte')`)
                writer.writeLine(`t.field('not', { type: 'IntFilterInput' })`)
              })
            })
            .write(")")
            .newLine()
        },
      },
    ],
  })

  context.addType("FloatFilterInput", "FloatFilterInputType")
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "FloatFilterInputType",
        initializer(writer) {
          writer
            .write("inputObjectType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: 'FloatFilterInput',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(`t.float('equals')`)
                writer.writeLine(`t.list.float('in')`)
                writer.writeLine(`t.list.float('notIn')`)
                writer.writeLine(`t.float('lt')`)
                writer.writeLine(`t.float('lte')`)
                writer.writeLine(`t.float('gt')`)
                writer.writeLine(`t.float('gte')`)
                writer.writeLine(`t.field('not', { type: 'FloatFilterInput' })`)
              })
            })
            .write(")")
            .newLine()
        },
      },
    ],
  })

  context.addType("BooleanFilterInput", "BooleanFilterInputType")
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "BooleanFilterInputType",
        initializer(writer) {
          writer
            .write("inputObjectType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: 'BooleanFilterInput',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(`t.boolean('equals')`)
                writer.writeLine(
                  `t.field('not', { type: 'BooleanFilterInput' })`
                )
              })
            })
            .write(")")
            .newLine()
        },
      },
    ],
  })

  context.addType("DateTimeFilterInput", "DateTimeFilterInputType")
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "DateTimeFilterInputType",
        initializer(writer) {
          writer
            .write("inputObjectType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: 'DateTimeFilterInput',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(`t.field('equals', { type: 'DateTime' })`)
                writer.writeLine(`t.list.field('in', { type: 'DateTime' })`)
                writer.writeLine(`t.list.field('notIn', { type: 'DateTime' })`)
                writer.writeLine(`t.field('lt', { type: 'DateTime' })`)
                writer.writeLine(`t.field('lte', { type: 'DateTime' })`)
                writer.writeLine(`t.field('gt', { type: 'DateTime' })`)
                writer.writeLine(`t.field('gte', { type: 'DateTime' })`)
                writer.writeLine(
                  `t.field('not', { type: 'DateTimeFilterInput' })`
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
