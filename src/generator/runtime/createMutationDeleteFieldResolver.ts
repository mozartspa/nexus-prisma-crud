import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { lowerFirst } from "./helpers"
import { RuntimeContext } from "./runtimeContext"

export function createMutationDeleteFieldResolver<TModel, TArgs>(
  modelName: string,
  context: RuntimeContext
) {
  const resolver = async (_root: any, args: TArgs, ctx: GetGen<"context">) => {
    const prisma = context.getPrismaClient(ctx)
    const propertyModelName = lowerFirst(modelName)
    const prismaModel = prisma[propertyModelName]

    const deleteFunc = prismaModel.delete as (query: unknown) => Promise<TModel>

    try {
      await deleteFunc({
        where: args,
      })
      return true
    } catch (err: any) {
      // In case the error was P2025 (that is because the record does not exist anymore)
      // we return false, otherwise we throw the error.
      if (err.code === "P2025") {
        return false
      } else {
        throw err
      }
    }
  }

  return resolver
}
