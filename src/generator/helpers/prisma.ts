import { DMMF } from "@prisma/generator-helper"

export type PrismaScalarType =
  | "String"
  | "Boolean"
  | "Int"
  | "BigInt"
  | "Float"
  | "Decimal"
  | "DateTime"
  | "Json"
  | "Bytes"

export function isAutoincrement(field: DMMF.Field) {
  return field.default && (field.default as any).name === "autoincrement"
    ? true
    : false
}
