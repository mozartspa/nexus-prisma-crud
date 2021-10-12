import { GraphQLScalarType } from "graphql"
import { ByteResolver } from "graphql-scalars"

export const Bytes = new GraphQLScalarType({
  ...ByteResolver,
  // Override the default 'Byte' name with one that matches what Nexus Prisma expects.
  name: "Bytes",
})
