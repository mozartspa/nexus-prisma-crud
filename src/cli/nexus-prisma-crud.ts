#!/usr/bin/env node
import { generatorHandler } from "@prisma/generator-helper"
import fs from "fs"
import path from "path"
import { generateAndEmit } from "../generator"

generatorHandler({
  onManifest() {
    return {
      prettyName: "Nexus Prisma CRUD",
      defaultOutput: path.resolve(__dirname, "../runtime"),
    }
  },
  async onGenerate(options) {
    const dmmf = options.dmmf
    const outputPath = options.generator.output!.value
    const prismaClientPath = options.otherGenerators.find(
      (o) => o.name === "client"
    )?.output?.value

    if (!prismaClientPath) {
      throw new Error(`Missing @prisma/client generator.`)
    }

    await generateAndEmit(dmmf, outputPath, prismaClientPath)

    fs.writeFileSync(
      path.resolve(__dirname, "../runtime/dmmf.json"),
      JSON.stringify(dmmf, null, 2)
    )
  },
})
