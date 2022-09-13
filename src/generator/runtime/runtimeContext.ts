import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { RuntimeSettings } from "./settings"

export type GetPrismaClient = (context: GetGen<"context">) => any

export type RuntimeContext = {
  getPrismaClient: GetPrismaClient
}

export function createRuntimeContext(
  settings: RuntimeSettings
): RuntimeContext {
  const getPrismaClient = (context: GetGen<"context">) => {
    const prisma = settings.getPrismaClient(context)
    if (!prisma) {
      throw new Error(
        `PrismaClient provided by "getPrismaClient" setting is not valid. Expected an instance of PrismaClient, received: ${prisma}.`
      )
    }
    return prisma
  }

  return {
    getPrismaClient,
  }
}
