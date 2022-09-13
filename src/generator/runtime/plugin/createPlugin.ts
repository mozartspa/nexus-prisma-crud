import { plugin } from "nexus"
import * as Scalars from "../../../scalars"
import { GeneratedTypes } from "../../types"
import { ChangeRuntimeSettings, RuntimeSettings } from "../settings"

function maybeScalar(typeName: string) {
  return (Scalars as any)[typeName]
}

export type NexusPrismaCrudPluginCreateOptions = {
  generatedTypes: GeneratedTypes
  changeSettings: ChangeRuntimeSettings
}

export type NexusPrismaCrudPluginOptions = Partial<RuntimeSettings>

export function createPlugin(options: NexusPrismaCrudPluginCreateOptions) {
  const { generatedTypes, changeSettings } = options

  const nexusPrismaCrudPlugin = (settings: NexusPrismaCrudPluginOptions) => {
    changeSettings(settings)

    return plugin({
      name: "NexusPrismaCrud",
      onMissingType: (typeName) => {
        return generatedTypes[typeName] ?? maybeScalar(typeName)
      },
    })
  }

  return nexusPrismaCrudPlugin
}
