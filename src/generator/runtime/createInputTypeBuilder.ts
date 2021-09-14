import { inputObjectType } from "nexus"
import { InputDefinitionBlock } from "nexus/dist/blocks"
import { FieldsObject } from "./types"

export function createInputTypeBuilder<T>(fieldsObject: FieldsObject<T>) {
  type Options = {
    name?: string
    include?: Exclude<keyof T, "$name">[]
    exclude?: Exclude<keyof T, "$name">[]
    extraDefinition?: (t: InputDefinitionBlock<string>) => void
  }

  const fields = fieldsObject as any

  return (options: Options = {}) => {
    const {
      name = String(fields.$name),
      include,
      exclude,
      extraDefinition,
    } = options

    return inputObjectType({
      name,
      definition(t) {
        for (const key in fields) {
          if (
            (!include || include.includes(key as any)) &&
            (!exclude || !exclude.includes(key as any))
          ) {
            const field = (fields as FieldsObject)[key]
            if (typeof field !== "string" && field.type) {
              t.field(field as any)
            }
          }
        }

        extraDefinition?.(t)
      },
    })
  }
}
