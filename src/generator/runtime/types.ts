export type InputDefinitionMeta = {
  $name: string
  $description?: string
}

export type ExtractInputDefinitionFieldNames<T> = Exclude<
  keyof T,
  keyof InputDefinitionMeta
>

export type InputDefinitionFieldSelector<T> = {
  [P in ExtractInputDefinitionFieldNames<T>]?: true
}

export type InputDefinition<T = any> = InputDefinitionMeta &
  {
    [P in keyof T]: { name: string; type?: any } | string
  }

export type DeepNullable<T> = {
  [P in keyof T]: DeepNullable<T[P]> | null | undefined
}
