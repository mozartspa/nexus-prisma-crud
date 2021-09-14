import { arg, FieldResolver, mutationField, nonNull } from "nexus"
import { NexusInputObjectTypeDef } from "nexus/dist/core"

export function createCreateMutationBuilder<
  TMutationName extends string,
  TInputOption
>(
  modelName: string,
  defaultMutationName: TMutationName,
  defaultResolver: FieldResolver<"Mutation", string>,
  inputBuilder: (opts: TInputOption) => NexusInputObjectTypeDef<string>
) {
  type Options<MutationName extends string> = {
    name?: MutationName
    input?: TInputOption
    resolve?: FieldResolver<"Mutation", MutationName>
  }

  return <MutationName extends string = TMutationName>(
    options: Options<MutationName> = {}
  ) => {
    const { name = defaultMutationName, resolve = defaultResolver } = options

    const inputType = `${modelName}CreateInput`

    const inputArgType = options.input ? inputBuilder(options.input) : inputType

    return mutationField(name, {
      type: modelName,
      args: {
        data: nonNull(arg({ type: inputArgType })),
      },
      resolve,
    })
  }
}
