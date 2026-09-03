import { generateModules } from "../__helpers__/generateModules"

const modelsRelationsSchema = `
  enum Role {
    USER
    ADMIN
  }

  model User {
    id       Int     @id @default(autoincrement())
    username String  @unique
    name     String?
    age      Int?
    amount   Decimal?
    bigint   BigInt?
    active   Boolean  @default(true)
    data     Json?
    blob     Bytes?
    role     Role     @default(USER)
  }
  
  model Client {
    id       Int       @id @default(autoincrement())
    name     String?
    age      Int?
    contacts Contact[]
  }
  
  model Contact {
    id       Int     @id @default(autoincrement())
    name     String
    phone    String?
    client   Client  @relation(fields: [clientId], references: [id])
    clientId Int
  }
`

it("can generate module with models and relations", async () => {
  const { tsSource } = await generateModules(modelsRelationsSchema)

  expect(tsSource).toMatchSnapshot()
})

it("always casts generated type names passed to nonNull()/nullable() as any", async () => {
  const { tsSource } = await generateModules(modelsRelationsSchema)

  // Every Prisma-model-derived type name handed to nexus' `nonNull`/`nullable`
  // helpers must be cast `as any`, since it is a dynamically generated name
  // that Nexus' own typegen union (`NexusNonNullableTypes`) has no way of
  // knowing about ahead of time. Without the cast, TypeScript only accepts
  // it by coincidence, when the same name happens to already be referenced
  // elsewhere in the consumer's own GraphQL schema.
  const uncastOccurrences = tsSource.match(/(?:nonNull|nullable)\('[^']+'\)/g)

  expect(uncastOccurrences).toBeNull()
})
