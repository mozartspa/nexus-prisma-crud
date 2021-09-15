import { FieldResolver } from "nexus"
import { ArgsRecord, NexusOutputFieldConfig } from "nexus/dist/core"

export type CreateMutationDeleteFieldBuilderOptions<
  TModelName extends string,
  TMutationName extends string
> = {
  modelName: TModelName
  defaultMutationName: TMutationName
  defaultResolver: FieldResolver<"Mutation", string>
  args: ArgsRecord
}

export function createMutationDeleteFieldBuilder<
  TModelName extends string,
  TMutationName extends string
>(options: CreateMutationDeleteFieldBuilderOptions<TModelName, TMutationName>) {
  const { modelName, defaultMutationName, defaultResolver, args } = options

  type Options<MutationName extends string> = {
    name?: MutationName
    resolve?: FieldResolver<"Mutation", MutationName>
  }

  type BuilderOptions<MutationName extends string> = Options<MutationName> &
    Omit<
      NexusOutputFieldConfig<"Mutation", MutationName>,
      keyof Options<MutationName> | "type" | "args"
    >

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
      type: modelName,
      args,
      resolve,
      ...rest,
    }
  }
}
