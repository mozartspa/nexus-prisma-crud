import { GetGen } from "nexus/dist/typegenTypeHelpers"
import { lowerFirst } from "./helpers"
import { RuntimeContext } from "./runtimeContext"

export function createQueryOneFieldResolver<TModel, TArgs>(
  modelName: string,
  context: RuntimeContext
) {
  const resolver = async (_root: any, args: TArgs, ctx: GetGen<"context">) => {
    const prisma = context.getPrismaClient(ctx)
    const propertyModelName = lowerFirst(modelName)
    const prismaModel = prisma[propertyModelName]

    const findUnique = prismaModel.findUnique as (
      query: unknown
    ) => Promise<TModel>

    return await findUnique({
      where: args,
    })
  }

  return resolver
}
