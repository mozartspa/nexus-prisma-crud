import { inputObjectType, nonNull, nullable } from "nexus"
import { InputDefinitionBlock } from "nexus/dist/blocks"
import { NexusInputObjectTypeConfig } from "nexus/dist/core"
import {
  IncludeConfig,
  InputDefinition,
  InputDefinitionFieldSelector,
} from "./types"

export function createInputTypeBuilder<T, TDefaultIncluded extends string>(
  inputDef: InputDefinition<T>,
  defaultIncluded?: TDefaultIncluded[]
) {
  type Options = {
    name?: string
    include?: InputDefinitionFieldSelector<T, IncludeConfig>
    exclude?: InputDefinitionFieldSelector<T, true>
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

    const getIncludeConfig = (key: string) => {
      if (!include) {
        return undefined
      }

      const config: IncludeConfig | undefined = (include as any)[key]

      return config
    }

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
              const includeConfig = getIncludeConfig(key)
              if (includeConfig === "optional") {
                t.field({ ...field, type: nullable(field.type) })
              } else if (includeConfig === "required") {
                t.field({ ...field, type: nonNull(field.type) })
              } else {
                t.field(field)
              }
            }
          }
        }

        extraDefinition?.(t)
      },
      ...rest,
    })
  }
}
