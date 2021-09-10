import { plugin } from "nexus"
import { generatedTypes } from "../runtime"

export type NexusPrismaCrudPluginOptions = {}

export const nexusPrismaCrudPlugin = (
  _options: NexusPrismaCrudPluginOptions
) => {
  return plugin({
    name: "NexusPrismaCrud",
    onMissingType: (typeName) => {
      return generatedTypes[typeName]
    },
  })
}
