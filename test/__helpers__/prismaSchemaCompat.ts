// Prisma 6 requires a datasource `url` to be present in the schema file.
// Prisma 7 forbids it there entirely — the connection string moves to
// `prisma.config.ts` / the `PrismaClient` constructor instead — so schema
// fixtures that only ever need `generate` (never an actual connection) have
// to drop the `url` line when running against Prisma 7.
export const prismaMajor = Number(
  require("@prisma/internals/package.json").version.split(".")[0]
)

export function toInstalledPrismaSyntax(schema: string): string {
  if (prismaMajor < 7) {
    return schema
  }

  return schema.replace(/^\s*url\s*=.*\n/m, "")
}

// Prisma 7 introduced a new `prisma-client` generator, replacing the legacy
// `prisma-client-js` one it still supports for backwards compatibility.
// Unlike `prisma-client-js`, it always requires a custom `output` and emits
// its main entry point as `client.ts` inside that directory instead of an
// `index.ts`/`package.json` — a different-enough layout that it needs its
// own dedicated compatibility test (see `typecheckNewClientGenerator.test.ts`).
export function toNewClientGeneratorSyntax(schema: string): string {
  return schema.replace(
    /provider\s*=\s*"prisma-client-js"/,
    'provider = "prisma-client"'
  )
}
