import { GetGen } from "nexus/dist/typegenTypeHelpers"

export type RuntimeSettings = {
  getPrismaClient: (context: GetGen<"context">) => any
}

export type ChangeRuntimeSettings = (
  newSettings: Partial<RuntimeSettings>
) => void

export function createSettings() {
  const settings: RuntimeSettings = {
    getPrismaClient: (ctx) => {
      const prisma = ctx["prisma"]
      if (!prisma) {
        throw new Error(`PrismaClient not found in context at field "prisma".`)
      }
      return prisma
    },
  }

  const changeSettings: ChangeRuntimeSettings = (
    newSettings: Partial<RuntimeSettings>
  ) => {
    Object.keys(newSettings).forEach((key) => {
      const value = (newSettings as any)[key]
      if (value !== undefined) {
        Object.assign(settings, { [key]: value })
      }
    })
  }

  return Object.assign(settings, { changeSettings })
}
