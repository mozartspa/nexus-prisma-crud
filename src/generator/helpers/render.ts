export type RenderObjectArg =
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

/**
 * Renders a dynamically generated Nexus/GraphQL type name for embedding as
 * a `type:` reference in generated code (e.g. `nonNull(asType("User"))`).
 *
 * Nexus checks bare string type-name literals against its own generated
 * `NexusNonNullableTypes` union, which has no way of knowing about names
 * this package only decides on at generation time — for a model not
 * otherwise referenced elsewhere in a consumer's schema, that check fails
 * to compile. Every such reference must therefore opt out of it with an
 * `as any` cast. Centralizing that here, instead of writing the cast
 * inline at each call site, means a future call site can't forget it (see
 * the missing cast fixed in 1.0.2, in the one place that wrote it inline).
 */
export function asType(value: string) {
  return `${asString(value)} as any`
}
