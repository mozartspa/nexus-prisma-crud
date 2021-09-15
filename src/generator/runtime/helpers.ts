import { GetGen } from "nexus/dist/typegenTypeHelpers"

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.substring(1)
}

export function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.substring(1)
}

export function getPrismaClient(context: GetGen<"context">) {
  return context["prisma"]
}

export function splitRecord(record: Record<string, unknown>, keys: string[]) {
  const selected: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}

  for (const key in record) {
    if (keys.includes(key)) {
      selected[key] = record[key]
    } else {
      rest[key] = record[key]
    }
  }

  return [selected, rest] as const
}
