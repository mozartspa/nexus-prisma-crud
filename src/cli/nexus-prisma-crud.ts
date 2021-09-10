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

    await generateAndEmit(dmmf, outputPath)
  },
})
