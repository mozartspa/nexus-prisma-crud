import { SourceFile, VariableDeclarationKind } from "ts-morph"
import { GeneratorContext } from "./types"

export function generateModelCommon(
  sourceFile: SourceFile,
  context: GeneratorContext
) {
  context.addType("RelatedCountOrderByInput", "RelatedCountOrderByInputType")
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "RelatedCountOrderByInputType",
        initializer(writer) {
          writer
            .write("inputObjectType(")
            .indent(1)
            .inlineBlock(() => {
              writer.writeLine(`name: 'RelatedCountOrderByInput',`)
              writer.write("definition(t)")
              writer.block(() => {
                writer.writeLine(
                  `t.field('_count', { type: 'SortDir' as any })`
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
