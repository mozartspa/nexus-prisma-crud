import { intArg, nonNull, queryField } from "nexus"
import { getPrismaClient, lowerFirst } from "./helpers"

export function createQueryBuilder(modelName: string) {
  type Options = {
    queryName?: string
  }

  return (options: Options = {}) => {
    const { queryName = lowerFirst(modelName) } = options

    return queryField(queryName, {
      type: modelName,
      args: {
        id: nonNull(intArg()),
      },
      resolve: (_, args, ctx) => {
        const prisma = getPrismaClient(ctx)
        const propertyModelName = lowerFirst(modelName)
        const prismaModel = prisma[propertyModelName]
        const findUnique = prismaModel.findUnique as (
          query: unknown
        ) => Promise<unknown>

        return findUnique({ where: { id: args.id } })
      },
    })
  }
}
