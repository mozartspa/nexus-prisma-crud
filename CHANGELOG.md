# Changelog

All notable changes to this project are documented in this file.

## 1.0.3 - 2026-09-03

### Changed

- Centralized the `as any` cast every generated Nexus type-name reference
  needs (see 1.0.2) into a single `asType()` helper, instead of writing it
  out inline at each of the ~30 call sites, so a future one can't forget it
  the way the fixed one did. Purely internal — generated output is
  unchanged.

### Added

- A real README: setup instructions, what's generated per model, and how
  to customize generated input types and operations. Every code sample is
  verified against a real generated Prisma 6 client by a new e2e test.

## 1.0.2 - 2026-09-03

### Fixed

- `generateQueryList` was missing the `as any` cast on the model type name
  passed to `nonNull()` for the list `items` field, producing
  `t.nonNull.list.field('items', { type: nonNull('User') })` instead of
  `t.nonNull.list.field('items', { type: nonNull('User' as any) })`.
  Every other generated type-name reference in the codebase already carries
  this cast, since Nexus checks bare string type names against its own
  generated `NexusNonNullableTypes` union at compile time. For any Prisma
  model not otherwise referenced as a GraphQL type elsewhere in a consumer's
  hand-written schema, this produced a real `TS2345` compile error
  (`Argument of type '"ModelName"' is not assignable to parameter of type
  'NexusNonNullableTypes'`) in the generated `index.ts`. A regression test
  now asserts every `nonNull()`/`nullable()` call in generated output
  carries the cast.

## 1.0.1 - 2026-09-03

### Fixed

- Generated code is now emitted as TypeScript source only (`index.ts`),
  instead of being additionally compiled to `.js`/`.d.ts` by ts-morph.
  Prisma 6 client model types are built from nested conditional/mapped
  types rather than plain interfaces; when ts-morph's declaration emit
  couldn't preserve them as a named reference, it fell back to an inlined
  structural expansion that silently dropped nullability from scalar and
  relation fields, breaking `t.field(...)` calls on affected fields in a
  consumer's hand-written schema.

## 1.0.0 - 2026-09-03

### Changed

- Updated for compatibility with Prisma 6: bumped `@prisma/generator-helper`
  and `@prisma/internals`, and bumped `typescript` to `^5.4` (required by
  Prisma 6's generated client types) and `jest`/`ts-jest` to versions that
  support Node's `node:`-prefixed module specifiers.

### Added

- An end-to-end test that runs the real `prisma generate` CLI and
  type-checks the generated code against a real, generated Prisma Client,
  in addition to the existing source-snapshot test.
