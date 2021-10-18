export type InputDefinitionMeta = {
  $name: string
  $description?: string
}

export type ExtractInputDefinitionFieldNames<T> = Exclude<
  keyof T,
  keyof InputDefinitionMeta
>

export type InputDefinitionFieldSelector<T, TValue = true> = {
  [P in ExtractInputDefinitionFieldNames<T>]?: TValue
}

export type IncludeConfig = true | "optional" | "required"

export type InputDefinition<T = any> = InputDefinitionMeta &
  {
    [P in keyof T]: InputDefinitionField | string
  }

export type InputDefinitionField = {
  name: string
  type: any
}

export type DeepNullable<T> = {
  [P in keyof T]: DeepNullable<T[P]> | null | undefined
}
