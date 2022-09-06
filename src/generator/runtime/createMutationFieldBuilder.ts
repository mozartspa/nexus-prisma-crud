import { arg, core, FieldResolver, nonNull } from "nexus"

export type CreateMutationFieldBuilderOptions<
  TModelName extends string,
  TMutationName extends string,
  TInputOption
> = {
  modelName: TModelName
  defaultMutationName: TMutationName
  defaultResolver: FieldResolver<"Mutation", string>
  inputBuilder: (opts: TInputOption) => core.NexusInputObjectTypeDef<string>
  defaultInputType: string
}

type Options<MutationName extends string, TInputOption> = {
  name?: MutationName
  input?: TInputOption
  resolve?: FieldResolver<"Mutation", MutationName>
}

type BuilderOptions<MutationName extends string, TInputOption> = Options<
  MutationName,
  TInputOption
> &
  Omit<
    core.NexusOutputFieldConfig<"Mutation", MutationName>,
    keyof Options<MutationName, TInputOption> | "type" | "args"
  >

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

  return <MutationName extends string = TMutationName>(
    options: BuilderOptions<MutationName, TInputOption> = {}
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
