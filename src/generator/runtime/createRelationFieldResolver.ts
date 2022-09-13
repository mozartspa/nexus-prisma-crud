import { GetGen, MaybePromise } from "nexus/dist/typegenTypeHelpers"
import { buildWhereUniqueInput } from "../helpers/constraints"
import { lowerFirst } from "./helpers"
import { RuntimeContext } from "./runtimeContext"

export function createRelationFieldResolver<TRootModel, TOutput>(
  modelName: string,
  relationFieldName: string,
  uniqueIdentifiers: string[],
  context: RuntimeContext
) {
  const resolver = async (
    root: TRootModel,
    _args: unknown,
    ctx: GetGen<"context">
  ): Promise<TOutput> => {
    const prisma = context.getPrismaClient(ctx)
    const propertyModelName = lowerFirst(modelName)
    const prismaModel = prisma[propertyModelName]

    if (typeof prismaModel.findUnique !== "function") {
      throw new Error(
        `The prisma model ${modelName} does not have a findUnique method available.`
      )
    }

    const findUnique = prismaModel.findUnique as (
      query: unknown
    ) => MaybePromise<unknown>

    const result: any = findUnique({
      where: buildWhereUniqueInput(root as any, uniqueIdentifiers),
      rejectOnNotFound: false,
    })

    return result[relationFieldName]()
  }

  return resolver
}
