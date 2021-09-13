export type FieldsObject<T = any> = {
  [P in keyof T]: { name: string; type?: any } | string
}
