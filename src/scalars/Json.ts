import { GraphQLScalarType } from "graphql"
import { JSONObjectResolver } from "graphql-scalars"

export const Json = new GraphQLScalarType({
  ...JSONObjectResolver,
  // Override the default 'JsonObject' name with one that matches what Nexus Prisma expects.
  name: "Json",
})
