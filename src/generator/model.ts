import { DMMF } from "@prisma/generator-helper"
import { SourceFile, VariableDeclarationKind } from "ts-morph"
import { resolveUniqueIdentifiers } from "./helpers/constraints"
import {
  getFieldDefinitionsForCreate,
  getFieldDefinitionsForModel,
  getFieldDefinitionsForOrderBy,
  getFieldDefinitionsForUpdate,
  getFieldDefinitionsForWhere,
  renderUniqueIdentifiersAsArgs,
  renderUniqueIdentifiersTSType,
} from "./helpers/model"
import { asString, renderObject } from "./helpers/render"
import { lowerFirst } from "./runtime/helpers"
import { GeneratorContext } from "./types"

function getNameMappings(model: DMMF.Model) {
  return {
    model: {
      outputDefinition: `${model.name}Model`,
    },
    where: {
      inputDefinition: `${model.name}Where`,
      inputType: `${model.name}WhereInput`,
      inputBuilder: `build${model.name}WhereInput`,
    },
    whereListRelation: {
      inputType: `${model.name}ListRelationWhereInput`,
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
  generateModelFields(sourceFile, model, context)
  generateWhere(sourceFile, model, context)
  generateWhereListRelation(sourceFile, model, context)
  generateOrderBy(sourceFile, model, context)
  generateQueryOne(sourceFile, model, context)
  generateQueryList(sourceFile, model, context)
  generateCreate(sourceFile, model, context)
  generateUpdate(sourceFile, model, context)
  generateDelete(sourceFile, model, context)
  generateExport(sourceFile, model, context)
}

function generateModelFields(
  sourceFile: SourceFile,
  model: DMMF.Model,
  _context: GeneratorContext
) {
  const { outputDefinition } = getNameMappings(model).model

  // Fields definition
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${outputDefinition}`,
        initializer(writer) {
          writer.writeLine(
            renderObject({
              $name: asString(model.name),
              ...getFieldDefinitionsForModel(model),
            })
          )
        },
      },
    ],
  })
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
          writer.writeLine(
            renderObject({
              $name: asString(inputType),
              ...getFieldDefinitionsForWhere(model, inputType),
            })
          )
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

function generateWhereListRelation(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  const { where, whereListRelation } = getNameMappings(model)

  const inputType = whereListRelation.inputType
  const whereInputType = where.inputType

  // Input type
  context.addType(inputType, `${inputType}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${inputType}Type`,
        initializer(writer) {
          writer
            .write("inputObjectType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: '${inputType}',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(
                  `t.field('every', { type: '${whereInputType}' as any })`
                )
                writer.writeLine(
                  `t.field('some', { type: '${whereInputType}' as any })`
                )
                writer.writeLine(
                  `t.field('none', { type: '${whereInputType}' as any })`
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
          writer.writeLine(
            renderObject({
              $name: asString(inputType),
              ...getFieldDefinitionsForOrderBy(model),
            })
          )
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
          writer.writeLine(
            renderObject({
              $name: asString(inputType),
              ...getFieldDefinitionsForCreate(model),
            })
          )
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
            `createCreateMutationResolver<PrismaLib.Prisma.${model.name}CreateArgs["data"], PrismaLib.${model.name}>('${model.name}')`
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
          writer.writeLine(
            renderObject({
              $name: asString(inputType),
              ...getFieldDefinitionsForUpdate(model),
            })
          )
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
          const uniqueIdentifiers = resolveUniqueIdentifiers(model)
            .map((name) => asString(name))
            .join(",")

          writer.writeLine(
            `createInputTypeBuilder(${inputDefinition}, [${uniqueIdentifiers}])`
          )
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

  const uniqueIdentifiers = resolveUniqueIdentifiers(model).map((name) =>
    asString(name)
  )
  const prismaUpdateData = `PrismaLib.Prisma.${model.name}UpdateArgs["data"]`

  sourceFile.addTypeAlias({
    name: `${model.name}UpdateDataType`,
    type(writer) {
      writer.writeLine(
        `DeepNullable<Omit<${prismaUpdateData}, ${uniqueIdentifiers.join(
          " | "
        )}>> & Pick<PrismaLib.${model.name}, ${uniqueIdentifiers.join(" | ")}>`
      )
    },
  })
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `${builder}Resolver`,
        initializer(writer) {
          writer.writeLine(
            `createUpdateMutationResolver<${
              model.name
            }UpdateDataType, PrismaLib.${model.name}>('${
              model.name
            }', [${uniqueIdentifiers.join(",")}])`
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
            writer.writeLine(`Model: ${names.model.outputDefinition},`)
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
          writer.newLine()
        },
      },
    ],
  })
}
