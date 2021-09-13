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
