type RenderObjectArg =
  | string
  | null
  | undefined
  | {
      [index: string]: RenderObjectArg
    }

export function renderObject(object: RenderObjectArg): string {
  if (object === undefined) {
    return "undefined"
  } else if (object === null) {
    return "null"
  } else if (typeof object === "string") {
    return object
  } else {
    return `{ ${Object.keys(object)
      .map((key) => {
        const value = object[key]
        return `${key}: ${renderObject(value)}`
      })
      .join(`,\n`)} }`
  }
}

export function asString(value: any) {
  return `'${value}'`
}
