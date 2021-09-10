import { plugin } from "nexus"

export type NexusPrismaCrudPluginOptions = {}

export const nexusPrismaCrudPlugin = (
  _options: NexusPrismaCrudPluginOptions
) => {
  return plugin({
    name: "NexusPrismaCrud",
    onMissingType: (typeName) => {
      console.log("TYPENAME MISSING", typeName)
    },
  })
}
