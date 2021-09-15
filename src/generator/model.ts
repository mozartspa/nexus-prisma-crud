import { DMMF } from "@prisma/generator-helper"
import { SourceFile, VariableDeclarationKind } from "ts-morph"
import {
  renderUniqueIdentifiersAsArgs,
  renderUniqueIdentifiersTSType,
} from "./helpers/model"
import { asString, renderObject } from "./helpers/render"
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
      operationName: `${lowerFirst(model.name)}`,
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
    mutationDelete: {
      builder: `${lowerFirst(model.name)}MutationDeleteOne`,
      operationName: `${lowerFirst(model.name)}Delete`,
    },
  }
}

export function generateModel(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  generateWhere(sourceFile, model, context)
  generateOrderBy(sourceFile, model, context)
  generateQueryOne(sourceFile, model, context)
  generateQueryList(sourceFile, model, context)
  generateCreate(sourceFile, model, context)
  generateUpdate(sourceFile, model, context)
  generateDelete(sourceFile, model, context)
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

function generateQueryOne(
  sourceFile: SourceFile,
  model: DMMF.Model,
  _context: GeneratorContext
) {
  const { builder, operationName } = getNameMappings(model).queryOne

  // Resolver
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Resolver`,
        initializer(writer) {
          const argsType = renderUniqueIdentifiersTSType(model)
          writer.writeLine(
            `createQueryOneFieldResolver<PrismaLib.${model.name}, ${argsType}>('${model.name}')`
          )
        },
      },
    ],
  })

  // Query field builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Field`,
        initializer(writer) {
          writer.writeLine(
            `createQueryOneFieldBuilder(${renderObject({
              modelName: asString(model.name),
              defaultQueryName: asString(operationName),
              defaultResolver: `${builder}Resolver`,
              args: renderUniqueIdentifiersAsArgs(model),
            })})`
          )
        },
      },
    ],
  })
}

function generateQueryList(
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
            `createQueryListFieldResolver<PrismaLib.Prisma.${model.name}FindManyArgs, PrismaLib.${model.name}>('${model.name}')`
          )
        },
      },
    ],
  })

  // Query field builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Field`,
        initializer(writer) {
          writer.writeLine(
            `createQueryListFieldBuilder(${renderObject({
              outputTypeName: asString(outputType),
              defaultQueryName: asString(operationName),
              defaultResolver: `${builder}Resolver`,
              whereInputBuilder: where.inputBuilder,
              orderByInputBuilder: orderBy.inputBuilder,
              defaultWhereInputName: asString(where.inputType),
              defaultOrderByInputName: asString(orderBy.inputType),
            })})`
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
              writer.writeLine(`$name: '${inputType}',`)
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

  // Mutation field builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Field`,
        initializer(writer) {
          writer.writeLine(
            `createMutationFieldBuilder(${renderObject({
              modelName: asString(model.name),
              defaultMutationName: asString(operationName),
              defaultResolver: `${builder}Resolver`,
              inputBuilder: inputBuilder,
              defaultInputType: asString(inputType),
            })})`
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

  // Mutation field builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Field`,
        initializer(writer) {
          writer.writeLine(
            `createMutationFieldBuilder(${renderObject({
              modelName: asString(model.name),
              defaultMutationName: asString(operationName),
              defaultResolver: `${builder}Resolver`,
              inputBuilder: inputBuilder,
              defaultInputType: asString(inputType),
            })})`
          )
        },
      },
    ],
  })
}

function generateDelete(
  sourceFile: SourceFile,
  model: DMMF.Model,
  _context: GeneratorContext
) {
  const { builder, operationName } = getNameMappings(model).mutationDelete

  // Resolver
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Resolver`,
        initializer(writer) {
          const argsType = renderUniqueIdentifiersTSType(model)
          writer.writeLine(
            `createMutationDeleteFieldResolver<PrismaLib.${model.name}, ${argsType}>('${model.name}')`
          )
        },
      },
    ],
  })

  // Query field builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Field`,
        initializer(writer) {
          writer.writeLine(
            `createMutationDeleteFieldBuilder(${renderObject({
              modelName: asString(model.name),
              defaultMutationName: asString(operationName),
              defaultResolver: `${builder}Resolver`,
              args: renderUniqueIdentifiersAsArgs(model),
            })})`
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
            writer.writeLine(`queryOne: ${names.queryOne.builder}Field,`)
            writer.writeLine(
              `queryOneResolver: ${names.queryOne.builder}Resolver,`
            )
            writer.writeLine(`queryList: ${names.queryList.builder}Field,`)
            writer.writeLine(
              `queryListResolver: ${names.queryList.builder}Resolver,`
            )
            writer.writeLine(`Create: ${names.mutationCreate.inputDefinition},`)
            writer.writeLine(
              `createInputType: ${names.mutationCreate.inputBuilder},`
            )
            writer.writeLine(
              `mutationCreate: ${names.mutationCreate.builder}Field,`
            )
            writer.writeLine(
              `mutationCreateResolver: ${names.mutationCreate.builder}Resolver,`
            )
            writer.writeLine(`Update: ${names.mutationUpdate.inputDefinition},`)
            writer.writeLine(
              `updateInputType: ${names.mutationUpdate.inputBuilder},`
            )
            writer.writeLine(
              `mutationUpdate: ${names.mutationUpdate.builder}Field,`
            )
            writer.writeLine(
              `mutationUpdateResolver: ${names.mutationUpdate.builder}Resolver,`
            )
            writer.writeLine(
              `mutationDelete: ${names.mutationDelete.builder}Field,`
            )
            writer.writeLine(
              `mutationDeleteResolver: ${names.mutationDelete.builder}Resolver,`
            )
          })
        },
      },
    ],
  })
}
