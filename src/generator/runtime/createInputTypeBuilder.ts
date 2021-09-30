import { inputObjectType } from "nexus"
import { InputDefinitionBlock } from "nexus/dist/blocks"
import { NexusInputObjectTypeConfig } from "nexus/dist/core"
import { InputDefinition, InputDefinitionFieldSelector } from "./types"

export function createInputTypeBuilder<T, TDefaultIncluded extends string>(
  inputDef: InputDefinition<T>,
  defaultIncluded?: TDefaultIncluded[]
) {
  type Options = {
    name?: string
    include?: Omit<InputDefinitionFieldSelector<T>, TDefaultIncluded>
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

    const shouldAddKey = (key: string) => {
      // Check exclude
      if (exclude && (exclude as any)[key]) {
        return false
      }

      // If default included, it must be included
      if (defaultIncluded && defaultIncluded.includes(key as any)) {
        return true
      }

      // Check include
      return !include || (include as any)[key]
    }

    return inputObjectType({
      name,
      definition(t) {
        for (const key in inputDef) {
          if (shouldAddKey(key)) {
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
