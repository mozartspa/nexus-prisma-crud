import { DMMF } from "@prisma/generator-helper"

/**
 * Taken from: https://github.com/prisma/nexus-prisma/blob/main/src/generator/helpers/constraints.ts
 *
 * Find the unique identifiers necessary to indentify a field.
 *
 * @remarks Unique fields for a model can be one of (in this order):
 *
 *          1. Exacrly one field with an `@id` annotation.
 *          2. Multiple fields with `@@id` clause.
 *          3. Exactly one field with a `@unique` annotation (if multiple, use first).
 *          4. Multiple fields with a `@@unique` clause.
 */
export function resolveUniqueIdentifiers(model: DMMF.Model): string[] {
  // Try finding 1
  const singleIdField = model.fields.find((f) => f.isId)

  if (singleIdField) {
    return [singleIdField.name]
  }

  // Try finding 2
  if (model.primaryKey && model.primaryKey.fields.length > 0) {
    return model.primaryKey.fields
  }

  // Try finding 3
  const singleUniqueField = model.fields.find((f) => f.isUnique)

  if (singleUniqueField) {
    return [singleUniqueField.name]
  }

  // Try finding 4
  if (model.uniqueFields && model.uniqueFields.length > 0) {
    return model.uniqueFields[0]
  }

  throw new Error(
    `Unable to resolve a unique identifier for the Prisma model: ${model.name}`
  )
}

export function resolveUniqueIdentifierFields(model: DMMF.Model): DMMF.Field[] {
  const identifiers = resolveUniqueIdentifiers(model)

  return identifiers.map((idName) => {
    const field = model.fields.find((f) => f.name === idName)
    if (!field) {
      throw new Error(
        `Unable to find field "${idName}" in Prisma model "${model.name}" while collecting unique identifier fields.`
      )
    }
    return field
  })
}
