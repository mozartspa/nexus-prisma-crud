import { plugin } from "nexus"
import { generatedTypes } from "../runtime"
import * as Scalars from "../scalars"

function maybeScalar(typeName: string) {
  return (Scalars as any)[typeName]
}

export type NexusPrismaCrudPluginOptions = {}

export const nexusPrismaCrudPlugin = (
  _options?: NexusPrismaCrudPluginOptions
) => {
  return plugin({
    name: "NexusPrismaCrud",
    onMissingType: (typeName) => {
      return generatedTypes[typeName] ?? maybeScalar(typeName)
    },
  })
}
