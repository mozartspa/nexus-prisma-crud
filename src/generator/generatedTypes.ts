import { SourceFile, VariableDeclarationKind } from "ts-morph"

export function generateGeneratedTypes(
  sourceFile: SourceFile,
  types: Record<string, string>
) {
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "generatedTypes",
        initializer(writer) {
          writer.inlineBlock(() => {
            Object.keys(types).forEach((typeName) => {
              const typeObjectName = types[typeName]
              writer.writeLine(`'${typeName}': ${typeObjectName},`)
            })
          })
        },
      },
    ],
  })
}
