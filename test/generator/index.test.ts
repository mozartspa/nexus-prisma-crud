import { generateModules } from "../__helpers__/generateModules"

const modelsRelationsSchema = `
  model User {
    id       Int     @id @default(autoincrement())
    username String  @unique
    name     String? 
    age      Int?
    amount   Decimal?
    bigint   BigInt?
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
