import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { lowerFirst } from "./helpers"
import { RuntimeContext } from "./runtimeContext"
import { DeepNullable } from "./types"

export function createCreateMutationResolver<TCreateInput, TModel>(
  modelName: string,
  context: RuntimeContext
) {
  const resolver = async (
    _root: any,
    args: { data: DeepNullable<TCreateInput> },
    ctx: GetGen<"context">
  ) => {
    const prisma = context.getPrismaClient(ctx)
    const propertyModelName = lowerFirst(modelName)
    const prismaModel = prisma[propertyModelName]

    const create = prismaModel.create as (query: unknown) => Promise<TModel>

    return await create({
      data: args.data,
    })
  }

  return resolver
}
