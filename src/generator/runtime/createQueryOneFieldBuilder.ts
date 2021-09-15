import { FieldResolver, intArg, nonNull } from "nexus"

export type CreateQueryOneFieldBuilderOptions<
  TModelName extends string,
  TQueryName extends string
> = {
  modelName: TModelName
  defaultQueryName: TQueryName
  defaultResolver: FieldResolver<"Query", string>
}

export function createQueryOneFieldBuilder<
  TModelName extends string,
  TQueryName extends string
>(options: CreateQueryOneFieldBuilderOptions<TModelName, TQueryName>) {
  const { modelName, defaultQueryName, defaultResolver } = options

  type Options<QueryName extends string> = {
    name?: QueryName
    resolve?: FieldResolver<"Query", QueryName>
  }

  return <QueryName extends string = TQueryName>(
    options: Options<QueryName> = {}
  ) => {
    const { name = defaultQueryName, resolve = defaultResolver } = options

    return {
      name,
      type: modelName,
      args: {
        id: nonNull(intArg()),
      },
      resolve,
    }
  }
}
