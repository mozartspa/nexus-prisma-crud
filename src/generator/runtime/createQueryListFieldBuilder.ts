import { arg, FieldResolver, intArg, list } from "nexus"
import { NexusInputObjectTypeDef } from "nexus/dist/core"

export type CreateQueryListFieldBuilderOptions<
  TOutputTypeName extends string,
  TQueryName extends string,
  TWhereOptions,
  TOrderByOptions
> = {
  outputTypeName: TOutputTypeName
  defaultQueryName: TQueryName
  defaultResolver: FieldResolver<"Query", string>
  whereInputBuilder: (opts: TWhereOptions) => NexusInputObjectTypeDef<string>
  orderByInputBuilder: (
    opts: TOrderByOptions
  ) => NexusInputObjectTypeDef<string>
  defaultWhereInputName: string
  defaultOrderByInputName: string
}

export function createQueryListFieldBuilder<
  TOutputTypeName extends string,
  TQueryName extends string,
  TWhereOptions,
  TOrderByOptions
>(
  options: CreateQueryListFieldBuilderOptions<
    TOutputTypeName,
    TQueryName,
    TWhereOptions,
    TOrderByOptions
  >
) {
  const {
    outputTypeName,
    defaultQueryName,
    defaultResolver,
    whereInputBuilder,
    orderByInputBuilder,
    defaultWhereInputName,
    defaultOrderByInputName,
  } = options

  type Options<QueryName extends string> = {
    name?: QueryName
    where?: TWhereOptions
    orderBy?: TOrderByOptions
    resolve?: FieldResolver<"Query", QueryName>
  }

  return <QueryName extends string = TQueryName>(
    options: Options<QueryName> = {}
  ) => {
    const {
      name = defaultQueryName,
      where,
      orderBy,
      resolve = defaultResolver,
    } = options

    const whereArgType = where
      ? whereInputBuilder(where)
      : defaultWhereInputName

    const orderByArgType = orderBy
      ? orderByInputBuilder(orderBy)
      : defaultOrderByInputName

    return {
      name,
      type: outputTypeName,
      args: {
        take: intArg(),
        skip: intArg(),
        where: arg({ type: whereArgType }),
        orderBy: list(arg({ type: orderByArgType })),
      },
      resolve,
    }
  }
}
