import { plugin } from "nexus"
import { GeneratedTypes } from "../generator/types"
import * as Scalars from "../scalars"

function maybeScalar(typeName: string) {
  return (Scalars as any)[typeName]
}

export type NexusPrismaCrudPluginOptions = {
  generatedTypes: GeneratedTypes
}

export const nexusPrismaCrudPlugin = (
  options: NexusPrismaCrudPluginOptions
) => {
  const { generatedTypes } = options

  return plugin({
    name: "NexusPrismaCrud",
    onMissingType: (typeName) => {
      return generatedTypes[typeName] ?? maybeScalar(typeName)
    },
  })
}
