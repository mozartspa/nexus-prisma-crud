import { arg, FieldResolver, nonNull } from "nexus"
import { NexusInputObjectTypeDef } from "nexus/dist/core"

export type CreateMutationFieldBuilderOptions<
  TModelName extends string,
  TMutationName extends string,
  TInputOption
> = {
  modelName: TModelName
  defaultMutationName: TMutationName
  defaultResolver: FieldResolver<"Mutation", string>
  inputBuilder: (opts: TInputOption) => NexusInputObjectTypeDef<string>
  defaultInputType: string
}

export function createMutationFieldBuilder<
  TModelName extends string,
  TMutationName extends string,
  TInputOption
>(
  options: CreateMutationFieldBuilderOptions<
    TModelName,
    TMutationName,
    TInputOption
  >
) {
  const {
    modelName,
    defaultMutationName,
    defaultResolver,
    inputBuilder,
    defaultInputType,
  } = options

  type Options<MutationName extends string> = {
    name?: MutationName
    input?: TInputOption
    resolve?: FieldResolver<"Mutation", MutationName>
  }

  return <MutationName extends string = TMutationName>(
    options: Options<MutationName> = {}
  ) => {
    const { name = defaultMutationName, resolve = defaultResolver } = options

    const inputArgType = options.input
      ? inputBuilder(options.input)
      : defaultInputType

    return {
      name,
      type: modelName,
      args: {
        data: nonNull(arg({ type: inputArgType })),
      },
      resolve,
    }
  }
}
