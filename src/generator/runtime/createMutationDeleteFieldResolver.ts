import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { getPrismaClient, lowerFirst } from "./helpers"

export function createMutationDeleteFieldResolver<TModel>(modelName: string) {
  const resolver = async (
    _root: any,
    args: { id: string | number },
    ctx: GetGen<"context">
  ) => {
    const prisma = getPrismaClient(ctx)
    const propertyModelName = lowerFirst(modelName)
    const prismaModel = prisma[propertyModelName]

    const deleteFunc = prismaModel.delete as (query: unknown) => Promise<TModel>

    return await deleteFunc({
      where: args,
    })
  }

  return resolver
}
