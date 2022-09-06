import { core } from "nexus"

export type GeneratorContext = {
  addType: (typeName: string, typeObjectName: string) => void
}

export type GeneratedTypes = Record<string, core.AllNexusTypeDefs | undefined>

export type RecordUnknown = Record<string, unknown>
