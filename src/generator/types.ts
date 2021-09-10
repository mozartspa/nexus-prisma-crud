import { AllNexusTypeDefs } from "nexus/dist/core"

export type GeneratorContext = {
  addType: (typeName: string, typeObjectName: string) => void
}

export type GeneratedTypes = Record<string, AllNexusTypeDefs | undefined>
