import { GraphQLScalarType } from "graphql"
import { JSONResolver } from "graphql-scalars"

export const Json = new GraphQLScalarType({
  ...JSONResolver,
  // Override the default 'JsonObject' name with one that matches what Nexus Prisma expects.
  name: "Json",
})
