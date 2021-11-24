import { GetGen } from "nexus/dist/typegenTypeHelpers"

export type RuntimeSettings = {
  getPrismaClient: (context: GetGen<"context">) => any
}

export const settings: RuntimeSettings = {
  getPrismaClient: (ctx) => {
    const prisma = ctx["prisma"]
    if (!prisma) {
      throw new Error(`PrismaClient not found in context at field "prisma".`)
    }
    return prisma
  },
}

export function changeSettings(newSettings: Partial<RuntimeSettings>) {
  Object.keys(newSettings).forEach((key) => {
    const value = (newSettings as any)[key]
    if (value !== undefined) {
      Object.assign(settings, { [key]: value })
    }
  })
}
