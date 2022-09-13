import { SourceFile, VariableDeclarationKind } from "ts-morph"
import { GeneratorContext } from "./types"

export function generateRuntimeContext(
  sourceFile: SourceFile,
  _context: GeneratorContext
) {
  // const settings
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `settings`,
        initializer(writer) {
          writer.writeLine(`NPCLib.createSettings()`)
        },
      },
    ],
  })

  // const runtimeContext
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: false,
    declarations: [
      {
        name: `runtimeContext`,
        initializer(writer) {
          writer.writeLine(`NPCLib.createRuntimeContext(settings)`)
        },
      },
    ],
  })
}

export function generatePlugin(
  sourceFile: SourceFile,
  _context: GeneratorContext
) {
  // export const nexusPrismaCrudPlugin
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: `nexusPrismaCrudPlugin`,
        initializer(writer) {
          writer.writeLine(
            `NPCLib.createPlugin({ generatedTypes, changeSettings: settings.changeSettings })`
          )
        },
      },
    ],
  })
}
