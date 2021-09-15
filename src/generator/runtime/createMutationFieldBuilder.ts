import { arg, FieldResolver, nonNull } from "nexus"
import {
  NexusInputObjectTypeDef,
  NexusOutputFieldConfig,
} from "nexus/dist/core"

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
      input,
      ...rest
    } = options

    const inputArgType = input ? inputBuilder(input) : defaultInputType

    return {
      name,
      type: modelName,
      args: {
        data: nonNull(arg({ type: inputArgType })),
      },
      resolve,
      ...rest,
    }
  }
}
