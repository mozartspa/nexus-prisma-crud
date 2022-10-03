import { BigIntResolver } from "graphql-scalars"
import { scalarType } from "nexus"

export const BigInt = scalarType({
  ...BigIntResolver,
  description: `The \`BigInt\` scalar type represents non-fractional signed whole numeric values.
@see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt`,
})
