import { GraphQLScalarType } from "graphql"
import { DateTimeResolver } from "graphql-scalars"

export const DateTime = new GraphQLScalarType(DateTimeResolver)
