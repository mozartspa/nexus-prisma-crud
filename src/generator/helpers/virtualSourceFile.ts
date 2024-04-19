import {
  OptionalKind,
  SourceFile,
  TypeAliasDeclarationStructure,
  VariableStatementStructure,
} from "ts-morph"

export class VirtualSourceFile {
  variableStatements: OptionalKind<VariableStatementStructure>[] = []
  typeAliases: OptionalKind<TypeAliasDeclarationStructure>[] = []

  addVariableStatement(structure: OptionalKind<VariableStatementStructure>) {
    this.variableStatements.push(structure)
  }

  addTypeAlias(structure: OptionalKind<TypeAliasDeclarationStructure>) {
    this.typeAliases.push(structure)
  }

  applyToSource(source: SourceFile) {
    source.addVariableStatements(this.variableStatements)
    source.addTypeAliases(this.typeAliases)
  }
}
