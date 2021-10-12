import { GraphQLScalarType } from "graphql"
import { BigIntResolver } from "graphql-scalars"

export const BigInt = new GraphQLScalarType({
  ...BigIntResolver,
  description: `The \`BigInt\` scalar type represents non-fractional signed whole numeric values.
@see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt`,
})
