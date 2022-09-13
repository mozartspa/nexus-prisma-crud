import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { lowerFirst, splitRecord } from "./helpers"
import { RuntimeContext } from "./runtimeContext"

export function createUpdateMutationResolver<TUpdateInput, TModel>(
  modelName: string,
  uniqueIdentifiers: string[],
  context: RuntimeContext
) {
  const resolver = async (
    _root: any,
    args: { data: TUpdateInput },
    ctx: GetGen<"context">
  ) => {
    const prisma = context.getPrismaClient(ctx)
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
