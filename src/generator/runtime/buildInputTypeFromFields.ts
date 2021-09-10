import { inputObjectType } from "nexus"

type FieldsObject = {
  [index: string]: { name: string; type?: any } | string
}

export function buildInputTypeFromFields(fieldsObject: FieldsObject) {
  const { $name, ...fields } = fieldsObject

  return inputObjectType({
    name: String($name),
    definition(t) {
      for (const key in fields) {
        const field = fields[key]
        if (typeof field !== "string" && field.type) {
          t.field(field as any)
        }
      }
    },
  })
}
