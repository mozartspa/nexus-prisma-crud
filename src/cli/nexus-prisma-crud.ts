#!/usr/bin/env node
import { generatorHandler } from "@prisma/generator-helper"
import path from "path"
import { Project, StructureKind, VariableDeclarationKind } from "ts-morph"
import { SemicolonPreference } from "typescript"

generatorHandler({
  onManifest() {
    return {
      prettyName: "Nexus Prisma CRUD",
      defaultOutput: path.resolve(__dirname, "../runtime"),
    }
  },
  async onGenerate(options) {
    const project = new Project({
      skipAddingFilesFromTsConfig: true,
      compilerOptions: {
        declaration: true,
      },
    })

    const outputPath = options.generator!.output!.value
    const enums = options.dmmf.datamodel.enums
    const models = options.dmmf.datamodel.models

    const indexSource = project.createSourceFile(
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

    if (models.length > 0) {
      indexSource.addVariableStatement({
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

      indexSource.addVariableStatement({
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
                    writer.writeLine(
                      `t.field('not', { type: IDFilterInputType })`
                    )
                  })
                })
                .write(")")
                .newLine()
            },
          },
        ],
      })

      indexSource.addVariableStatement({
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
                      `t.field('not', { type: StringFilterInputType })`
                    )
                  })
                })
                .write(")")
                .newLine()
            },
          },
        ],
      })

      indexSource.addVariableStatement({
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
                    writer.writeLine(
                      `t.list.field('notIn', { type: 'DateTime' })`
                    )
                    writer.writeLine(`t.field('lt', { type: 'DateTime' })`)
                    writer.writeLine(`t.field('lte', { type: 'DateTime' })`)
                    writer.writeLine(`t.field('gt', { type: 'DateTime' })`)
                    writer.writeLine(`t.field('gte', { type: 'DateTime' })`)
                    writer.writeLine(
                      `t.field('not', { type: DateTimeFilterInputType })`
                    )
                  })
                })
                .write(")")
                .newLine()
            },
          },
        ],
      })

      indexSource.addVariableStatement({
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
                    writer.writeLine(
                      `t.field('not', { type: IntFilterInputType })`
                    )
                  })
                })
                .write(")")
                .newLine()
            },
          },
        ],
      })

      indexSource.addVariableStatement({
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
                      `t.field('not', { type: BooleanFilterInputType })`
                    )
                  })
                })
                .write(")")
                .newLine()
            },
          },
        ],
      })

      models.forEach((model) => {
        indexSource.addExportDeclaration({
          moduleSpecifier: `./${model.name}`,
        })

        const whereUniqueInputTypeName = `${model.name}WhereUniqueInput`
        const whereInputName = `${model.name}Where`
        const whereInputTypeName = `${model.name}WhereInput`
        const orderByInputTypeName = `${model.name}OrderByInput`
        const modelRelationFilterName = `${model.name}RelationFilterInput`
        const modelListRelationFilterName = `${model.name}ListRelationFilterInput`

        const sourceFile = project.createSourceFile(
          `${outputPath}/${model.name}.ts`,
          {
            statements: [
              {
                kind: StructureKind.ImportDeclaration,
                namedImports: ["inputObjectType"],
                moduleSpecifier: "nexus",
              },
            ],
          },
          {
            overwrite: true,
          }
        )

        sourceFile.addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          isExported: true,
          declarations: [
            {
              name: `${whereUniqueInputTypeName}Type`,
              initializer(writer) {
                writer
                  .write("inputObjectType(")
                  .inlineBlock(() => {
                    writer.writeLine(`name: '${whereUniqueInputTypeName}',`)
                    writer.writeLine("definition(t)")
                    writer.inlineBlock(() => {
                      writer.writeLine(`t.nonNull.id('id')`)
                    })
                  })
                  .write(")")
                  .newLine()
              },
            },
          ],
        })

        // WHERE

        sourceFile.addImportDeclaration({
          namedImports: [
            "IDFilterInputType, StringFilterInputType, IntFilterInputType",
          ],
          moduleSpecifier: "./index",
        })

        sourceFile.addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          isExported: true,
          declarations: [
            {
              name: `${whereInputName}`,
              initializer(writer) {
                writer
                  .inlineBlock(() => {
                    writer.writeLine(`$name: '${whereInputTypeName}',`)
                    model.fields.forEach((field) => {
                      writer.write(`${field.name}:`)
                      writer.inlineBlock(() => {
                        writer.writeLine(`name: '${field.name}',`)
                        if (field.kind === "scalar") {
                          if (
                            field.name === "id" ||
                            field.name.endsWith("Id")
                          ) {
                            writer.writeLine(`type: IDFilterInputType,`)
                          } else {
                            writer.writeLine(
                              `type: ${field.type}FilterInputType,`
                            )
                          }
                        }
                      })
                      writer.write(",").newLine()
                    })

                    /*
                    writer.writeLine(
                      `t.list.field('AND', { type: '${whereInputTypeName}' })`
                    )
                    writer.writeLine(
                      `t.list.field('OR', { type: '${whereInputTypeName}' })`
                    )
                    writer.writeLine(
                      `t.list.field('NOT', { type: '${whereInputTypeName}' })`
                    )
                    */
                  })
                  .newLine()
              },
            },
          ],
        })

        sourceFile.addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          isExported: true,
          declarations: [
            {
              name: `${whereInputTypeName}Type`,
              initializer(writer) {
                writer
                  .write("inputObjectType(")
                  .inlineBlock(() => {
                    writer.writeLine(`name: '${whereInputTypeName}',`)
                    writer.writeLine("definition(t)")
                    writer.inlineBlock(() => {
                      model.fields.forEach((field) => {
                        if (field.kind === "scalar") {
                          if (
                            field.name === "id" ||
                            field.name.endsWith("Id")
                          ) {
                            writer.write(`t.field('${field.name}',`)
                            writer
                              .inlineBlock(() => {
                                writer.writeLine(`type: 'IDFilterInput'`)
                              })
                              .write(")")
                              .newLine()
                          } else {
                            writer.write(`t.field('${field.name}',`)
                            writer
                              .inlineBlock(() => {
                                writer.writeLine(
                                  `type: '${field.type}FilterInput'`
                                )
                              })
                              .write(")")
                              .newLine()
                          }
                        } else if (field.kind === "object") {
                          if (field.isList) {
                            writer
                              .write(`t.field('${field.name}',`)
                              .inlineBlock(() => {
                                writer.writeLine(
                                  `type: '${field.type}ListRelationFilterInput'`
                                )
                              })
                              .write(")")
                              .newLine()
                          } else {
                            writer
                              .write(`t.field('${field.name}',`)
                              .inlineBlock(() => {
                                writer.writeLine(
                                  `type: '${field.type}RelationFilterInput'`
                                )
                              })
                              .write(")")
                              .newLine()
                          }
                        } else if (field.kind === "enum") {
                          writer
                            .write(`t.field('${field.name}',`)
                            .inlineBlock(() => {
                              writer.writeLine(
                                `type: '${field.type}EnumFilterInput'`
                              )
                            })
                            .write(")")
                            .newLine()
                        }
                      })

                      writer.writeLine(
                        `t.list.field('AND', { type: '${whereInputTypeName}' })`
                      )
                      writer.writeLine(
                        `t.list.field('OR', { type: '${whereInputTypeName}' })`
                      )
                      writer.writeLine(
                        `t.list.field('NOT', { type: '${whereInputTypeName}' })`
                      )
                    })
                  })
                  .write(")")
                  .newLine()
              },
            },
          ],
        })

        sourceFile.addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          isExported: true,
          declarations: [
            {
              name: `${modelRelationFilterName}Type`,
              initializer(writer) {
                writer
                  .write("inputObjectType(")
                  .inlineBlock(() => {
                    writer.writeLine(`name: '${modelRelationFilterName}',`)
                    writer.writeLine("definition(t)")
                    writer.inlineBlock(() => {
                      writer.writeLine(
                        `t.field('is', { type: '${whereInputTypeName}' })`
                      )
                      writer.writeLine(
                        `t.field('isNot', { type: '${whereInputTypeName}' })`
                      )
                    })
                  })
                  .write(")")
                  .newLine()
              },
            },
          ],
        })

        sourceFile.addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          isExported: true,
          declarations: [
            {
              name: `${modelListRelationFilterName}Type`,
              initializer(writer) {
                writer
                  .write("inputObjectType(")
                  .inlineBlock(() => {
                    writer.writeLine(`name: '${modelListRelationFilterName}',`)
                    writer.writeLine("definition(t)")
                    writer.inlineBlock(() => {
                      writer.writeLine(
                        `t.field('every', { type: '${whereInputTypeName}' })`
                      )
                      writer.writeLine(
                        `t.field('some', { type: '${whereInputTypeName}' })`
                      )
                      writer.writeLine(
                        `t.field('none', { type: '${whereInputTypeName}' })`
                      )
                    })
                  })
                  .write(")")
                  .newLine()
              },
            },
          ],
        })

        sourceFile.addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          isExported: true,
          declarations: [
            {
              name: `${orderByInputTypeName}Type`,
              initializer(writer) {
                writer
                  .write("inputObjectType(")
                  .inlineBlock(() => {
                    writer.writeLine(`name: '${orderByInputTypeName}',`)
                    writer.writeLine("definition(t)")
                    writer.inlineBlock(() => {
                      model.fields.forEach((field) => {
                        if (field.kind === "scalar" || field.kind === "enum") {
                          writer.writeLine(
                            `t.field('${field.name}', { type: 'SortDir' })`
                          )
                        } else if (field.kind === "object") {
                          const relatedModel = models.find(
                            (model) => model.name === field.type
                          )
                          if (relatedModel) {
                            writer.writeLine(
                              `t.field('${field.name}', { type: '${relatedModel.name}OrderByInput' })`
                            )
                          }
                        }
                      })
                    })
                  })
                  .write(")")
                  .newLine()
              },
            },
          ],
        })

        sourceFile.formatText({
          indentSize: 2,
          convertTabsToSpaces: true,
          semicolons: SemicolonPreference.Remove,
        })
      })

      if (enums.length > 0) {
        enums.forEach((enumModel) => {
          indexSource.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
              {
                name: `${enumModel.name}EnumFilterInputType`,
                initializer(writer) {
                  writer
                    .write("inputObjectType(")
                    .indent(1)
                    .inlineBlock(() => {
                      writer.writeLine(
                        `name: '${enumModel.name}EnumFilterInput',`
                      )
                      writer.write("definition(t)")
                      writer.block(() => {
                        writer.writeLine(
                          `t.field('equals', { type: '${enumModel.name}' })`
                        )
                        writer.writeLine(
                          `t.list.field('in', { type: '${enumModel.name}' })`
                        )
                        writer.writeLine(
                          `t.list.field('notIn', { type: '${enumModel.name}' })`
                        )
                        writer.writeLine(
                          `t.field('lt', { type: '${enumModel.name}' })`
                        )
                        writer.writeLine(
                          `t.field('lte', { type: '${enumModel.name}' })`
                        )
                        writer.writeLine(
                          `t.field('gt', { type: '${enumModel.name}' })`
                        )
                        writer.writeLine(
                          `t.field('gte', { type: '${enumModel.name}' })`
                        )
                        writer.writeLine(
                          `t.field('not', { type: '${enumModel.name}EnumFilterInput' })`
                        )
                      })
                    })
                    .write(")")
                    .newLine()
                },
              },
            ],
          })
        })
      }

      indexSource.formatText({
        indentSize: 2,
        convertTabsToSpaces: true,
        semicolons: SemicolonPreference.Remove,
      })
    }

    await project.save()
    await project.emit()
  },
})
