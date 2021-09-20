import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { getPrismaClient, lowerFirst } from "./helpers"
import { DeepNullable } from "./types"

export function createQueryListFieldResolver<TFindManyArgs, TModel>(
  modelName: string
) {
  const resolver = async (
    _root: any,
    args: DeepNullable<TFindManyArgs>,
    ctx: GetGen<"context">
  ) => {
    const prisma = getPrismaClient(ctx)
    const propertyModelName = lowerFirst(modelName)
    const prismaModel = prisma[propertyModelName]

    const findMany = prismaModel.findMany as (
      query: unknown
    ) => Promise<TModel[]>

    const count = prismaModel.count as (query: unknown) => Promise<number>

    const { take, skip, where, orderBy } = args as any

    return {
      items: await findMany({
        ...args,
        take: take ?? undefined,
        skip: skip ?? undefined,
        where: where,
        orderBy: orderBy,
      }),
      total: await count({ where: where }),
    }
  }

  return resolver
}
