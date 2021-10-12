import * as DecimalJs from "decimal.js"
import { GraphQLScalarType, Kind } from "graphql"

export const Decimal = new GraphQLScalarType({
  name: "Decimal",
  description: "An arbitrary-precision Decimal type",
  /**
   * Value sent to the client
   */
  serialize(value: DecimalJs.Decimal) {
    return value.toString()
  },
  /**
   * Value from the client
   */
  parseValue(value: DecimalJs.Decimal.Value) {
    return new DecimalJs.Decimal(value)
  },
  parseLiteral(ast) {
    if (
      ast.kind === Kind.INT ||
      ast.kind === Kind.FLOAT ||
      ast.kind === Kind.STRING
    ) {
      return new DecimalJs.Decimal(ast.value)
    }
    return null
  },
})
