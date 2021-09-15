import { FieldResolver, intArg, nonNull } from "nexus"
import { NexusOutputFieldConfig } from "nexus/dist/core"

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
      resolve = defaultResolver,
      ...rest
    } = options

    return {
      name,
      type: modelName,
      args: {
        id: nonNull(intArg()),
      },
      resolve,
      ...rest,
    }
  }
}
