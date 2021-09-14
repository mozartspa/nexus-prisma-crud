import { arg, FieldResolver, intArg, list, queryField } from "nexus"
import { NexusInputObjectTypeDef } from "nexus/dist/core"

export function createListQueryBuilder<
  TQueryName extends string,
  TWhereOptions,
  TOrderByOptions
>(
  modelName: string,
  defaultQueryName: TQueryName,
  defaultResolver: FieldResolver<"Query", string>,
  whereInputBuilder: (opts: TWhereOptions) => NexusInputObjectTypeDef<string>,
  orderByInputBuilder: (
    opts: TOrderByOptions
  ) => NexusInputObjectTypeDef<string>
) {
  type Options<QueryName extends string> = {
    queryName?: QueryName
    where?: TWhereOptions
    orderBy?: TOrderByOptions
    resolve?: FieldResolver<"Query", QueryName>
  }

  return <QueryName extends string = TQueryName>(
    options: Options<QueryName> = {}
  ) => {
    const { queryName = defaultQueryName, resolve = defaultResolver } = options

    const listType = `${modelName}List`
    const whereType = `${modelName}WhereInput`
    const orderByType = `${modelName}OrderByInput`

    const whereArgType = options.where
      ? whereInputBuilder(options.where)
      : whereType

    const orderByArgType = options.orderBy
      ? orderByInputBuilder(options.orderBy)
      : orderByType

    return queryField(queryName, {
      type: listType,
      args: {
        take: intArg(),
        skip: intArg(),
        where: arg({ type: whereArgType }),
        orderBy: list(arg({ type: orderByArgType })),
      },
      resolve,
    })
  }
}
