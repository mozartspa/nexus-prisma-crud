import { ByteResolver } from "graphql-scalars"
import { scalarType } from "nexus"

export const Bytes = scalarType({
  ...ByteResolver,
  // Override the default 'Byte' name with one that matches what Nexus Prisma expects.
  name: "Bytes",
})
