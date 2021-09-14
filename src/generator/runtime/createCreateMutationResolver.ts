import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { getPrismaClient, lowerFirst } from "./helpers"
import { DeepNullable } from "./types"

export function createCreateMutationResolver<TCreateInput, TModel>(
  modelName: string
) {
  const resolver = async (
    _root: any,
    args: { data: DeepNullable<TCreateInput> },
    ctx: GetGen<"context">
  ) => {
    const prisma = getPrismaClient(ctx)
    const propertyModelName = lowerFirst(modelName)
    const prismaModel = prisma[propertyModelName]

    const create = prismaModel.create as (query: unknown) => Promise<TModel>

    return await create({
      data: args.data,
    })
  }

  return resolver
}
