# nexus-prisma-crud

A [Prisma](https://www.prisma.io) generator that reads your `schema.prisma` and produces ready-to-use [Nexus](https://nexusjs.org) GraphQL types, queries and mutations for each model: object types, `where`/`orderBy` input types, list/create/update/delete operations, and their resolvers — wired to your Prisma Client.

It generates plain TypeScript source (no compilation step), which your own project compiles as part of your build.

## Requirements

- Prisma 6 or 7 (`prisma` and `@prisma/client`) — note that Prisma 7 itself
  requires Node `^20.19 || ^22.12 || >=24.0`
- TypeScript ≥ 5.1 (required by Prisma 6's generated client types)
- Node ≥ 18.18
- `nexus` ^1.1.0

## Install

```bash
npm install nexus-prisma-crud
# or
yarn add nexus-prisma-crud
```

## 1. Add the generator to `schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

generator crud {
  provider = "nexus-prisma-crud"
  output   = "../src/generated/nexus-prisma-crud"
}
```

Two things matter here:

- The Prisma Client generator block **must be named `client`** (`generator client { ... }`) — that's how `nexus-prisma-crud` locates it to import its types from.
- `output` is required.

Then run:

```bash
npx prisma generate
```

This writes an `index.ts` file to the configured `output` directory, exporting everything described below.

## 2. Wire it into your Nexus schema

```ts
import { makeSchema, queryType, mutationType } from "nexus"
import {
  nexusPrismaCrudPlugin,
  UserCRUD,
  UserWhereInputType,
  // ...one CRUD export + WhereInput export per model
} from "./generated/nexus-prisma-crud"

const Query = queryType({
  definition(t) {
    t.field(UserCRUD.queryOne())
    t.field(UserCRUD.queryList())
  },
})

const Mutation = mutationType({
  definition(t) {
    t.field(UserCRUD.mutationCreate())
    t.field(UserCRUD.mutationUpdate())
    t.field(UserCRUD.mutationDelete())
  },
})

export const schema = makeSchema({
  types: [
    Query,
    Mutation,
    UserCRUD,
    UserWhereInputType, // see "Where input types" below
  ],
  plugins: [
    nexusPrismaCrudPlugin({
      // Tells the generated resolvers how to get a PrismaClient instance
      // out of your GraphQL context.
      getPrismaClient: (ctx) => ctx.prisma,
    }),
  ],
})
```

`nexusPrismaCrudPlugin` also auto-registers every generated GraphQL type your schema references (filter input types, scalars, `*List`, `*CreateInput`, `*OrderByInput`, ...) — you only need to explicitly list the types you construct yourself (like `UserCRUD` above), plus `*WhereInput` types (see below).

### Where input types

`*WhereInput` types are **not** auto-registered, unlike everything else, since they can meaningfully expand the size of your schema for models you may not want filterable. If a query references one (e.g. `UserCRUD.queryList()`'s default `where` argument) and you haven't listed it in `types`, schema construction throws a clear error telling you which type is missing — just add it, as `UserWhereInputType` is added above.

## 3. Define each model's object type

For every model, `nexus-prisma-crud` generates a `<Model>CRUD.Model` lookup object with a ready-to-use Nexus field config per column — including relations, which come with their own resolver. You wire it into a hand-written `objectType`:

```ts
import { objectType } from "nexus"
import { UserCRUD } from "./generated/nexus-prisma-crud"

export const UserType = objectType({
  name: "User",
  definition(t) {
    t.field(UserCRUD.Model.id)
    t.field(UserCRUD.Model.email)
    t.field(UserCRUD.Model.name)
    t.field(UserCRUD.Model.posts) // a relation field, resolved automatically
  },
})
```

This step is intentionally manual — it's how you pick which fields (and which relations) are actually exposed in your API, instead of everything in the Prisma model being exposed by default.

## What's generated per model

For a model `User`, `nexus-prisma-crud` generates (all under `UserCRUD`, plus the type definitions it references):

| `UserCRUD.*` | What it is |
| --- | --- |
| `Model` | Field-config lookup, one entry per column, for building your `objectType` |
| `queryOne` / `queryOneResolver` | Field builder / resolver for fetching one record by its unique identifier |
| `queryList` / `queryListResolver` | Field builder / resolver for `{ items, total }`, with `where`, `orderBy`, `take`, `skip` |
| `mutationCreate` / `mutationCreateResolver` | Field builder / resolver for creating a record |
| `mutationUpdate` / `mutationUpdateResolver` | Field builder / resolver for updating a record by its unique identifier |
| `mutationDelete` / `mutationDeleteResolver` | Field builder / resolver returning `true`/`false` (`false` if the record no longer existed) |
| `Where`, `whereInputType` | Field lookup / input-type builder for `UserWhereInput` |
| `OrderBy`, `orderByInputType` | Field lookup / input-type builder for `UserOrderByInput` |
| `Create`, `createInputType` | Field lookup / input-type builder for `UserCreateInput` |
| `Update`, `updateInputType` | Field lookup / input-type builder for `UserUpdateInput` |

Every `*InputType` builder (`whereInputType`, `orderByInputType`, `createInputType`, `updateInputType`) and every operation builder (`queryOne`, `queryList`, `mutationCreate`, `mutationUpdate`, `mutationDelete`) is a **function** — call it with no arguments to get the default, or pass options to customize it.

## Customizing generated input types

Every generated input type builder accepts `include`/`exclude` (per-field) and an `extraDefinition` escape hatch:

```ts
// Only expose `email` and `name` in the update input, instead of every column.
UserCRUD.updateInputType({
  include: { email: true, name: true },
})

// Expose everything except `internalNotes`.
UserCRUD.createInputType({
  exclude: { internalNotes: true },
})

// Add fields nexus-prisma-crud doesn't know about.
UserCRUD.whereInputType({
  extraDefinition(t) {
    t.string("emailContainsCI")
  },
})
```

## Customizing generated operations

`queryOne`, `queryList`, `mutationCreate`, `mutationUpdate` and `mutationDelete` accept a `name` override, a `resolve` override, a `where`/`orderBy`/`input` option (forwarded to the corresponding input-type builder above), and any other Nexus field option:

```ts
t.field(
  UserCRUD.queryList({
    name: "activeUsers",
    where: { exclude: { deletedAt: true } },
    resolve: async (root, args, ctx) => {
      // call the default resolver, or write your own from scratch
      return UserCRUD.queryListResolver(root, args, ctx)
    },
  })
)
```

## Scalars

Generated schemas reference the `Decimal`, `BigInt`, `Bytes`, `DateTime` and `Json` GraphQL scalars for the corresponding Prisma types. `nexusPrismaCrudPlugin` registers them automatically; they're also available as `Scalars` from `nexus-prisma-crud` if you need them elsewhere in a hand-written schema:

```ts
import { Scalars } from "nexus-prisma-crud"
// Scalars.Decimal, Scalars.BigInt, Scalars.Bytes, Scalars.DateTime, Scalars.Json
```

---

See [CHANGELOG.md](./CHANGELOG.md) for release notes.
