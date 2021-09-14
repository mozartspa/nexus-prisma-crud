import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { getPrismaClient, lowerFirst } from "./helpers"
import { DeepNullable } from "./types"

export function createUpdateMutationResolver<TUpdateInput, TModel>(
  modelName: string
) {
  const resolver = async (
    _root: any,
    args: { data: DeepNullable<TUpdateInput> & { id: string | number } },
    ctx: GetGen<"context">
  ) => {
    const prisma = getPrismaClient(ctx)
    const propertyModelName = lowerFirst(modelName)
    const prismaModel = prisma[propertyModelName]

    const update = prismaModel.update as (query: unknown) => Promise<TModel>

    const { id, ...data } = args.data

    return await update({
      where: { id },
      data,
    })
  }

  return resolver
}
