import { inputObjectType } from "nexus"
import { FieldsObject } from "./types"

export function createInputTypeBuilder<T>(fieldsObject: FieldsObject<T>) {
  type Options = {
    name?: string
    include?: Exclude<keyof T, "$name">[]
  }

  const fields = fieldsObject as any

  return (options: Options = {}) => {
    const { name = String(fields.$name), include } = options

    return inputObjectType({
      name,
      definition(t) {
        for (const key in fields) {
          if (!include || include.includes(key as any)) {
            const field = (fields as FieldsObject)[key]
            if (typeof field !== "string" && field.type) {
              t.field(field as any)
            }
          }
        }
      },
    })
  }
}
