import { DMMF } from "@prisma/generator-helper"
import { SourceFile, VariableDeclarationKind } from "ts-morph"
import { lowerFirst } from "./runtime/helpers"
import { GeneratorContext } from "./types"

function getNameMappings(model: DMMF.Model) {
  return {
    where: {
      inputDefinition: `${model.name}Where`,
      inputType: `${model.name}WhereInput`,
      inputBuilder: `build${model.name}WhereInput`,
    },
    orderBy: {
      inputDefinition: `${model.name}OrderBy`,
      inputType: `${model.name}OrderByInput`,
      inputBuilder: `build${model.name}OrderByInput`,
    },
    queryOne: {
      builder: `${lowerFirst(model.name)}QueryOne`,
    },
    queryList: {
      outputType: `${model.name}List`,
      builder: `${lowerFirst(model.name)}QueryList`,
      operationName: `${lowerFirst(model.name)}List`,
    },
    mutationCreate: {
      inputDefinition: `${model.name}Create`,
      inputType: `${model.name}CreateInput`,
      inputBuilder: `build${model.name}CreateInput`,
      builder: `${lowerFirst(model.name)}MutationCreateOne`,
      operationName: `${lowerFirst(model.name)}Create`,
    },
    mutationUpdate: {
      inputDefinition: `${model.name}Update`,
      inputType: `${model.name}UpdateInput`,
      inputBuilder: `build${model.name}UpdateInput`,
      builder: `${lowerFirst(model.name)}MutationUpdateOne`,
      operationName: `${lowerFirst(model.name)}Update`,
    },
  }
}

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
  generateOrderBy(sourceFile, model, context)
  generateQuery(sourceFile, model, context)
  generateListQuery(sourceFile, model, context)
  generateCreate(sourceFile, model, context)
  generateUpdate(sourceFile, model, context)
  generateExport(sourceFile, model, context)
}

function generateWhere(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  const { inputDefinition, inputType, inputBuilder } =
    getNameMappings(model).where

  // Fields definition
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${inputDefinition}`,
        initializer(writer) {
          writer
            .inlineBlock(() => {
              writer.writeLine(`$name: '${inputType}',`)
              model.fields.forEach((field) => {
                writer.write(`${field.name}:`)
                writer.inlineBlock(() => {
                  writer.writeLine(`name: '${field.name}',`)
                  if (field.kind === "scalar") {
                    if (field.isId && field.type === "String") {
                      writer.writeLine(`type: 'IDFilterInput' as const,`)
                    } else {
                      writer.writeLine(
                        `type: '${field.type}FilterInput' as const,`
                      )
                    }
                  }
                })
                writer.write(",").newLine()
              })

              writer.write(`AND:`)
              writer.inlineBlock(() => {
                writer.writeLine(`name: 'AND',`)
                writer.writeLine(`type: list('${inputType}'),`)
              })
              writer.write(",").newLine()

              writer.write(`OR:`)
              writer.inlineBlock(() => {
                writer.writeLine(`name: 'OR',`)
                writer.writeLine(`type: list('${inputType}'),`)
              })
              writer.write(",").newLine()

              writer.write(`NOT:`)
              writer.inlineBlock(() => {
                writer.writeLine(`name: 'NOT',`)
                writer.writeLine(`type: list('${inputType}'),`)
              })
              writer.write(",").newLine()
            })
            .newLine()
        },
      },
    ],
  })

  // Input type builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: inputBuilder,
        initializer(writer) {
          writer.writeLine(`createInputTypeBuilder(${inputDefinition})`)
        },
      },
    ],
  })

  // Input Type
  context.addType(inputType, `${inputType}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${inputType}Type`,
        initializer(writer) {
          writer.writeLine(`${inputBuilder}()`)
        },
      },
    ],
  })
}

function generateOrderBy(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  const { inputDefinition, inputType, inputBuilder } =
    getNameMappings(model).orderBy

  // Fields definition
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${inputDefinition}`,
        initializer(writer) {
          writer
            .inlineBlock(() => {
              writer.writeLine(`$name: '${inputType}',`)
              model.fields.forEach((field) => {
                writer.write(`${field.name}:`)
                writer.inlineBlock(() => {
                  writer.writeLine(`name: '${field.name}',`)
                  if (field.kind === "scalar") {
                    writer.writeLine(`type: 'SortDir',`)
                  }
                })
                writer.write(",").newLine()
              })
            })
            .newLine()
        },
      },
    ],
  })

  // Input type builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: inputBuilder,
        initializer(writer) {
          writer.writeLine(`createInputTypeBuilder(${inputDefinition})`)
        },
      },
    ],
  })

  // Input Type
  context.addType(inputType, `${inputType}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${inputType}Type`,
        initializer(writer) {
          writer.writeLine(`${inputBuilder}()`)
        },
      },
    ],
  })
}

function generateQuery(
  sourceFile: SourceFile,
  model: DMMF.Model,
  _context: GeneratorContext
) {
  const { builder } = getNameMappings(model).queryOne

  // Query builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}`,
        initializer(writer) {
          writer.writeLine(`createQueryBuilder('${model.name}')`)
        },
      },
    ],
  })
}

function generateListQuery(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  const {
    queryList: { outputType, builder, operationName },
    where,
    orderBy,
  } = getNameMappings(model)

  // List output type
  context.addType(outputType, `${outputType}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${outputType}Type`,
        initializer(writer) {
          writer
            .write("objectType(")
            .inlineBlock(() => {
              writer.writeLine(`name: '${outputType}',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(
                  `t.nonNull.list.field('items', { type: nonNull('${model.name}') })`
                )
                writer.writeLine(`t.nonNull.int('total')`)
              })
            })
            .write(")")
            .newLine()
        },
      },
    ],
  })

  // Resolver
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Resolver`,
        initializer(writer) {
          writer.writeLine(
            `createListQueryResolver<PrismaLib.Prisma.${model.name}FindManyArgs, PrismaLib.${model.name}>('${model.name}')`
          )
        },
      },
    ],
  })

  // Query builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}`,
        initializer(writer) {
          writer.writeLine(
            `createListQueryBuilder('${model.name}', '${operationName}', ${builder}Resolver, ${where.inputBuilder}, ${orderBy.inputBuilder})`
          )
        },
      },
    ],
  })
}

function generateCreate(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  const { builder, inputBuilder, inputDefinition, inputType, operationName } =
    getNameMappings(model).mutationCreate

  // Fields definition
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${inputDefinition}`,
        initializer(writer) {
          writer
            .inlineBlock(() => {
              writer.writeLine(`$name: '${inputDefinition}',`)
              model.fields.forEach((field) => {
                const isScalar = field.kind === "scalar"
                const { isRequired } = field

                if (isScalar) {
                  writer.write(`${field.name}:`)
                  writer.inlineBlock(() => {
                    writer.writeLine(`name: '${field.name}',`)
                    writer.writeLine(
                      `type: ${
                        isRequired
                          ? `nonNull('${field.type}')`
                          : `'${field.type}'`
                      }`
                    )
                  })
                  writer.write(",").newLine()
                }
              })
            })
            .newLine()
        },
      },
    ],
  })

  // Input type builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: inputBuilder,
        initializer(writer) {
          writer.writeLine(`createInputTypeBuilder(${inputDefinition})`)
        },
      },
    ],
  })

  // Input Type
  context.addType(inputType, `${inputType}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${inputType}Type`,
        initializer(writer) {
          writer.writeLine(`${inputBuilder}()`)
        },
      },
    ],
  })

  // Resolver
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Resolver`,
        initializer(writer) {
          writer.writeLine(
            `createCreateMutationResolver<PrismaLib.Prisma.${model.name}CreateInput, PrismaLib.${model.name}>('${model.name}')`
          )
        },
      },
    ],
  })

  // Mutation builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}`,
        initializer(writer) {
          writer.writeLine(
            `createCreateMutationBuilder('${model.name}', '${operationName}', ${builder}Resolver, ${inputBuilder})`
          )
        },
      },
    ],
  })
}

function generateUpdate(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  const { builder, inputBuilder, inputDefinition, inputType, operationName } =
    getNameMappings(model).mutationUpdate

  // Fields definition
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${inputDefinition}`,
        initializer(writer) {
          writer
            .inlineBlock(() => {
              writer.writeLine(`$name: '${inputType}',`)
              model.fields.forEach((field) => {
                const isScalar = field.kind === "scalar"
                const isId = field.isId

                if (isId) {
                  writer.write(`${field.name}:`)
                  writer.inlineBlock(() => {
                    writer.writeLine(`name: '${field.name}',`)
                    writer.writeLine(`type: nonNull('${field.type}')`)
                  })
                  writer.write(",").newLine()
                } else if (isScalar) {
                  writer.write(`${field.name}:`)
                  writer.inlineBlock(() => {
                    writer.writeLine(`name: '${field.name}',`)
                    writer.writeLine(`type: '${field.type}'`)
                  })
                  writer.write(",").newLine()
                }
              })
            })
            .newLine()
        },
      },
    ],
  })

  // Input type builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: inputBuilder,
        initializer(writer) {
          writer.writeLine(`createInputTypeBuilder(${inputDefinition})`)
        },
      },
    ],
  })

  // Input Type
  context.addType(inputType, `${inputType}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${inputType}Type`,
        initializer(writer) {
          writer.writeLine(`${inputBuilder}()`)
        },
      },
    ],
  })

  // Resolver
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Resolver`,
        initializer(writer) {
          writer.writeLine(
            `createUpdateMutationResolver<PrismaLib.Prisma.${model.name}UpdateInput, PrismaLib.${model.name}>('${model.name}')`
          )
        },
      },
    ],
  })

  // Mutation builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}`,
        initializer(writer) {
          writer.writeLine(
            `createUpdateMutationBuilder('${model.name}', '${operationName}', ${builder}Resolver, ${inputBuilder})`
          )
        },
      },
    ],
  })
}

function generateExport(
  sourceFile: SourceFile,
  model: DMMF.Model,
  _context: GeneratorContext
) {
  const names = getNameMappings(model)

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${model.name}CRUD`,
        initializer(writer) {
          writer.block(() => {
            writer.writeLine(`Where: ${names.where.inputDefinition},`)
            writer.writeLine(`whereInputType: ${names.where.inputBuilder},`)
            writer.writeLine(`OrderBy: ${names.orderBy.inputDefinition},`)
            writer.writeLine(`orderByInputType: ${names.orderBy.inputBuilder},`)
            writer.writeLine(`queryOne: ${names.queryOne.builder},`)
            writer.writeLine(`queryList: ${names.queryList.builder},`)
            writer.writeLine(`Create: ${names.mutationCreate.inputDefinition},`)
            writer.writeLine(
              `createInputType: ${names.mutationCreate.inputBuilder},`
            )
            writer.writeLine(
              `mutationCreateOne: ${names.mutationCreate.builder},`
            )
            writer.writeLine(`Update: ${names.mutationUpdate.inputDefinition},`)
            writer.writeLine(
              `updateInputType: ${names.mutationUpdate.inputBuilder},`
            )
            writer.writeLine(
              `mutationUpdateOne: ${names.mutationUpdate.builder},`
            )
          })
        },
      },
    ],
  })
}
