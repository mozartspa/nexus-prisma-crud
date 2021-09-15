import { DMMF } from "@prisma/generator-helper"
import { resolveUniqueIdentifierFields } from "./constraints"
import { StandardGraphQLScalarTypes } from "./graphql"
import { PrismaScalarType } from "./prisma"
import { renderObject } from "./render"

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

  if (field.isList && field.isRequired) {
    return `nonNull(list(nonNull(arg({ type: '${graphqlType}' }))))`
  } else if (field.isList && !field.isRequired) {
    return `list(nonNull(arg({ type: '${graphqlType}' })))`
  } else {
    return `nullable(arg({ type: '${graphqlType}' }))`
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
