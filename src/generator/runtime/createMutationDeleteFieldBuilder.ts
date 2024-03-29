import { core, FieldResolver, nonNull } from "nexus"

export type CreateMutationDeleteFieldBuilderOptions<
  TModelName extends string,
  TMutationName extends string
> = {
  modelName: TModelName
  defaultMutationName: TMutationName
  defaultResolver: FieldResolver<"Mutation", string>
  args: core.ArgsRecord
}

type Options<MutationName extends string> = {
  name?: MutationName
  resolve?: FieldResolver<"Mutation", MutationName>
}

type BuilderOptions<MutationName extends string> = Options<MutationName> &
  Omit<
    core.NexusOutputFieldConfig<"Mutation", MutationName>,
    keyof Options<MutationName> | "type" | "args"
  >

export function createMutationDeleteFieldBuilder<
  TModelName extends string,
  TMutationName extends string
>(options: CreateMutationDeleteFieldBuilderOptions<TModelName, TMutationName>) {
  const { defaultMutationName, defaultResolver, args } = options

  return <MutationName extends string = TMutationName>(
    options: BuilderOptions<MutationName> = {}
  ) => {
    const {
      name = defaultMutationName,
      resolve = defaultResolver,
      ...rest
    } = options

    return {
      name,
      type: nonNull("Boolean"),
      args,
      resolve,
      ...rest,
    }
  }
}
