import { DMMF } from "@prisma/generator-helper"
import {
  resolveUniqueIdentifierFields,
  resolveUniqueIdentifiers,
} from "./constraints"
import { StandardGraphQLScalarTypes } from "./graphql"
import { isAutoincrement, PrismaScalarType } from "./prisma"
import { asString, renderObject } from "./render"

function allCasesHandled(x: never): never {
  throw new Error(`All cases were not handled:\n${x}`)
}

export function renderUniqueIdentifiersTSType(model: DMMF.Model): string {
  const fields = resolveUniqueIdentifierFields(model)

  let type = {} as Record<string, string>

  for (const field of fields) {
    type[field.name] = `PrismaLib.${model.name}["${field.name}"]`
  }

  return renderObject(type)
}

export function renderFieldAsArg(field: DMMF.Field): string {
  const graphqlType = fieldTypeToGraphQLType(field)

  if (field.isList) {
    if (field.isRequired) {
      return `nonNull(list(nonNull(arg({ type: '${graphqlType}' as any }))))`
    } else {
      return `list(nonNull(arg({ type: '${graphqlType}' as any })))`
    }
  } else if (field.isRequired) {
    return `nonNull(arg({ type: '${graphqlType}' as any }))`
  } else {
    return `nullable(arg({ type: '${graphqlType}' as any }))`
  }
}

export function renderFieldAsNexusType(
  field: DMMF.Field,
  options: {
    isRequired?: boolean
  } = {}
): string {
  const graphqlType = fieldTypeToGraphQLType(field)

  const { isRequired = field.isRequired } = options

  if (field.isList) {
    if (isRequired) {
      return `nonNull(list(nonNull('${graphqlType}' as any)))`
    } else {
      return `list(nonNull('${graphqlType}' as any))`
    }
  } else if (isRequired) {
    return `nonNull('${graphqlType}' as any)`
  } else {
    return `nullable('${graphqlType}' as any)`
  }
}

export function renderUniqueIdentifiersAsArgs(model: DMMF.Model): string {
  const fields = resolveUniqueIdentifierFields(model)

  let type = {} as Record<string, string>

  for (const field of fields) {
    type[field.name] = renderFieldAsArg(field)
  }

  return renderObject(type)
}

export function getFieldDefinitionsForCreate(model: DMMF.Model) {
  let type = {} as Record<string, { name: string; type: string }>

  model.fields.forEach((field) => {
    // Only scalar and enum supported
    if (!(field.kind === "scalar" || field.kind === "enum")) {
      return
    }

    // Skip autoincrement and db generated fields
    if (isAutoincrement(field) || field.isGenerated) {
      return
    }

    // Not required if it has a default value
    const isRequired = field.isRequired && !field.hasDefaultValue

    type[field.name] = {
      name: asString(field.name),
      type: renderFieldAsNexusType(field, { isRequired }),
    }
  })

  return type
}

export function getFieldDefinitionsForUpdate(model: DMMF.Model) {
  let type = {} as Record<string, { name: string; type: string }>

  const uniqueIdentifiers = resolveUniqueIdentifiers(model)

  model.fields.forEach((field) => {
    // Only scalar and enum supported
    if (!(field.kind === "scalar" || field.kind === "enum")) {
      return
    }

    // Required only if it is an ID
    const isRequired = uniqueIdentifiers.includes(field.name)

    type[field.name] = {
      name: asString(field.name),
      type: renderFieldAsNexusType(field, { isRequired }),
    }
  })

  return type
}

export function getFieldDefinitionsForOrderBy(model: DMMF.Model) {
  let type = {} as Record<string, { name: string; type: string }>

  model.fields.forEach((field) => {
    switch (field.kind) {
      case "scalar":
      case "enum":
        type[field.name] = {
          name: asString(field.name),
          type: asString("SortDir"),
        }
        break

      case "object":
        if (field.isList) {
          // One-to-Many
          type[field.name] = {
            name: asString(field.name),
            type: asString("RelatedCountOrderByInput"),
          }
        } else {
          // Many-to-One or One-to-One
          // TODO: type name is hardcoded, should depend on name mapping
          type[field.name] = {
            name: asString(field.name),
            type: asString(`${field.type}OrderByInput`),
          }
        }
        break
    }
  })

  return type
}

export function getFieldDefinitionsForWhere(
  model: DMMF.Model,
  inputTypeName: string
) {
  let type = {} as Record<string, { name: string; type: string }>

  model.fields.forEach((field) => {
    switch (field.kind) {
      case "scalar": {
        const graphqlType = fieldTypeToGraphQLType(field)
        type[field.name] = {
          name: asString(field.name),
          type: `nullable(${asString(`${graphqlType}FilterInput`)} as any)`,
        }
        break
      }

      case "enum": {
        type[field.name] = {
          name: asString(field.name),
          type: `nullable(${asString(`${field.type}EnumFilterInput`)} as any)`,
        }
        break
      }

      case "object": {
        if (field.isList) {
          // One-to-Many
          // TODO: type name is hardcoded, should depend on name mapping
          type[field.name] = {
            name: asString(field.name),
            type: `nullable(${asString(
              `${field.type}ListRelationWhereInput`
            )} as any)`,
          }
        } else {
          // Many-to-One or One-to-One
          // TODO: type name is hardcoded, should depend on name mapping
          type[field.name] = {
            name: asString(field.name),
            type: `nullable(${asString(`${field.type}WhereInput`)} as any)`,
          }
        }
        break
      }
    }
  })

  type["AND"] = {
    name: asString("AND"),
    type: `nullable(list('${inputTypeName}' as any))`,
  }

  type["OR"] = {
    name: asString("OR"),
    type: `nullable(list('${inputTypeName}' as any))`,
  }

  type["NOT"] = {
    name: asString("NOT"),
    type: `nullable(list('${inputTypeName}' as any))`,
  }

  return type
}

export function fieldTypeToGraphQLType(field: DMMF.Field): string {
  const fieldKind = field.kind

  switch (fieldKind) {
    case "scalar": {
      const typeName = field.type as PrismaScalarType

      if (field.isId && field.type === "String") {
        return StandardGraphQLScalarTypes.ID
      }

      switch (typeName) {
        case "String": {
          return StandardGraphQLScalarTypes.String
        }
        case "Int": {
          return StandardGraphQLScalarTypes.Int
        }
        case "Boolean": {
          return StandardGraphQLScalarTypes.Boolean
        }
        case "Float": {
          return StandardGraphQLScalarTypes.Float
        }
        case "BigInt": {
          return "BigInt"
        }
        case "DateTime": {
          return "DateTime"
        }
        case "Json": {
          return "Json"
        }
        case "Bytes": {
          return "Bytes"
        }
        case "Decimal": {
          return "Decimal"
        }
        default: {
          return allCasesHandled(typeName)
        }
      }
    }
    case "enum": {
      return field.type
    }
    case "object": {
      return field.type
    }
    case "unsupported": {
      return field.type
    }
    default:
      allCasesHandled(fieldKind)
  }
}
