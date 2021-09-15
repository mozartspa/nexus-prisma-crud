import { inputObjectType } from "nexus"
import { InputDefinitionBlock } from "nexus/dist/blocks"
import { NexusInputObjectTypeConfig } from "nexus/dist/core"
import { InputDefinition, InputDefinitionFieldSelector } from "./types"

export function createInputTypeBuilder<T>(inputDef: InputDefinition<T>) {
  type Options = {
    name?: string
    include?: InputDefinitionFieldSelector<T>
    exclude?: InputDefinitionFieldSelector<T>
    extraDefinition?: (t: InputDefinitionBlock<string>) => void
  }

  type BuilderOptions = Options &
    Omit<NexusInputObjectTypeConfig<string>, keyof Options | "definition">

  return (options: BuilderOptions = {}) => {
    const {
      name = inputDef.$name,
      include,
      exclude,
      extraDefinition,
      ...rest
    } = options

    return inputObjectType({
      name,
      definition(t) {
        for (const key in inputDef) {
          if (
            (!include || (include as any)[key]) &&
            (!exclude || !(exclude as any)[key])
          ) {
            const field = inputDef[key as keyof typeof inputDef]
            if (typeof field !== "string" && field.type) {
              t.field(field as any)
            }
          }
        }

        extraDefinition?.(t)
      },
      ...rest,
    })
  }
}
