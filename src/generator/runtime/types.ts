export type FieldsObject<T = any> = {
  [P in keyof T]: { name: string; type?: any } | string
}

export type DeepNullable<T> = {
  [P in keyof T]: DeepNullable<T[P]> | null | undefined
}
