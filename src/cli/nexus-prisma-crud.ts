#!/usr/bin/env node
import { generatorHandler } from "@prisma/generator-helper"
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

    if (!outputPath) {
      throw new Error(`Missing @prisma/client output.`)
    }

    await generateAndEmit(dmmf, outputPath, prismaClientPath)
  },
})
