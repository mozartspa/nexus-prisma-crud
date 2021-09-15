import { arg, FieldResolver, intArg, list } from "nexus"
import {
  NexusInputObjectTypeDef,
  NexusOutputFieldConfig,
} from "nexus/dist/core"

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

  type BuilderOptions<QueryName extends string> = Options<QueryName> &
    Omit<
      NexusOutputFieldConfig<"Query", QueryName>,
      keyof Options<QueryName> | "type" | "args"
    >

  return <QueryName extends string = TQueryName>(
    options: BuilderOptions<QueryName> = {}
  ) => {
    const {
      name = defaultQueryName,
      where,
      orderBy,
      resolve = defaultResolver,
      ...rest
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
      ...rest,
    }
  }
}
