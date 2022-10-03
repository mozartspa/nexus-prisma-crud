import { JSONResolver } from "graphql-scalars"
import { scalarType } from "nexus"

export const Json = scalarType({
  ...JSONResolver,
  // Override the default 'JsonObject' name with one that matches what Nexus Prisma expects.
  name: "Json",
})
