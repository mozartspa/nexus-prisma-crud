import { DMMF } from "@prisma/generator-helper"
import { SourceFile, VariableDeclarationKind } from "ts-morph"
import { capitalize, lowerFirst } from "./runtime/helpers"
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
  generateOrderBy(sourceFile, model, context)
  generateQuery(sourceFile, model, context)
  generateListQuery(sourceFile, model, context)
  generateCreate(sourceFile, model, context)
  generateUpdate(sourceFile, model, context)
}

function generateWhere(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  const whereDefName = `${model.name}Where`
  const whereInputTypeName = `${model.name}WhereInput`
  const whereInputBuilderName = `build${capitalize(whereInputTypeName)}`

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
                    if (field.isId && field.type === "String") {
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

  // Input type builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: whereInputBuilderName,
        initializer(writer) {
          writer.writeLine(`createInputTypeBuilder(${whereDefName})`)
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

function generateOrderBy(
  sourceFile: SourceFile,
  model: DMMF.Model,
  context: GeneratorContext
) {
  const orderDefName = `${model.name}OrderBy`
  const orderInputTypeName = `${model.name}OrderByInput`
  const orderInputBuilderName = `build${capitalize(orderInputTypeName)}`

  // Fields definition
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${orderDefName}`,
        initializer(writer) {
          writer
            .inlineBlock(() => {
              writer.writeLine(`$name: '${orderInputTypeName}',`)
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
    isExported: true,
    declarations: [
      {
        name: orderInputBuilderName,
        initializer(writer) {
          writer.writeLine(`createInputTypeBuilder(${orderDefName})`)
        },
      },
    ],
  })

  // Input Type
  context.addType(orderInputTypeName, `${orderInputTypeName}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${orderInputTypeName}Type`,
        initializer(writer) {
          writer.writeLine(`buildInputTypeFromFields(${orderDefName})`)
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
  const builderName = `${lowerFirst(model.name)}Query`

  // Query builder
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${builderName}`,
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
  const listOutputTypeName = `${model.name}List`
  const builderName = `${lowerFirst(model.name)}ListQuery`
  const defaultQueryName = `${lowerFirst(model.name)}List`

  // List output type
  context.addType(listOutputTypeName, `${listOutputTypeName}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${listOutputTypeName}Type`,
        initializer(writer) {
          writer
            .write("objectType(")
            .inlineBlock(() => {
              writer.writeLine(`name: '${listOutputTypeName}',`)
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
    isExported: true,
    declarations: [
      {
        name: `${builderName}Resolver`,
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
    isExported: true,
    declarations: [
      {
        name: `${builderName}`,
        initializer(writer) {
          writer.writeLine(
            `createListQueryBuilder('${model.name}', '${defaultQueryName}', ${builderName}Resolver, build${model.name}WhereInput, build${model.name}OrderByInput)`
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
  const inputDef = `${model.name}Create`
  const inputName = `${model.name}CreateInput`
  const inputBuilder = `build${inputName}`
  const builderName = `${lowerFirst(model.name)}CreateMutation`
  const defaultMutationName = `${lowerFirst(model.name)}Create`

  // Fields definition
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${inputDef}`,
        initializer(writer) {
          writer
            .inlineBlock(() => {
              writer.writeLine(`$name: '${inputName}',`)
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
    isExported: true,
    declarations: [
      {
        name: inputBuilder,
        initializer(writer) {
          writer.writeLine(`createInputTypeBuilder(${inputDef})`)
        },
      },
    ],
  })

  // Input Type
  context.addType(inputName, `${inputName}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${inputName}Type`,
        initializer(writer) {
          writer.writeLine(`buildInputTypeFromFields(${inputDef})`)
        },
      },
    ],
  })

  // Resolver
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${builderName}Resolver`,
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
    isExported: true,
    declarations: [
      {
        name: `${builderName}`,
        initializer(writer) {
          writer.writeLine(
            `createCreateMutationBuilder('${model.name}', '${defaultMutationName}', ${builderName}Resolver, build${model.name}CreateInput)`
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
  const inputDef = `${model.name}Update`
  const inputName = `${model.name}UpdateInput`
  const inputBuilder = `build${inputName}`
  const builderName = `${lowerFirst(model.name)}UpdateMutation`
  const defaultMutationName = `${lowerFirst(model.name)}Update`

  // Fields definition
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${inputDef}`,
        initializer(writer) {
          writer
            .inlineBlock(() => {
              writer.writeLine(`$name: '${inputName}',`)
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
    isExported: true,
    declarations: [
      {
        name: inputBuilder,
        initializer(writer) {
          writer.writeLine(`createInputTypeBuilder(${inputDef})`)
        },
      },
    ],
  })

  // Input Type
  context.addType(inputName, `${inputName}Type`)
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${inputName}Type`,
        initializer(writer) {
          writer.writeLine(`buildInputTypeFromFields(${inputDef})`)
        },
      },
    ],
  })

  // Resolver
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `${builderName}Resolver`,
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
    isExported: true,
    declarations: [
      {
        name: `${builderName}`,
        initializer(writer) {
          writer.writeLine(
            `createUpdateMutationBuilder('${model.name}', '${defaultMutationName}', ${builderName}Resolver, build${model.name}UpdateInput)`
          )
        },
      },
    ],
  })
}
