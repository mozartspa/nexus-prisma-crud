import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { getPrismaClient, lowerFirst, splitRecord } from "./helpers"

export function createUpdateMutationResolver<TUpdateInput, TModel>(
  modelName: string,
  uniqueIdentifiers: string[]
) {
  const resolver = async (
    _root: any,
    args: { data: TUpdateInput },
    ctx: GetGen<"context">
  ) => {
    const prisma = getPrismaClient(ctx)
    const propertyModelName = lowerFirst(modelName)
    const prismaModel = prisma[propertyModelName]

    const update = prismaModel.update as (query: unknown) => Promise<TModel>

    const [ids, data] = splitRecord(
      args.data as Record<string, unknown>,
      uniqueIdentifiers
    )

    return await update({
      where: ids,
      data,
    })
  }

  return resolver
}
