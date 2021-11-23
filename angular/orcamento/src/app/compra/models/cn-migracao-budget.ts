export interface CnMigracaoBudgetPayload {
  idCompraNegociacaoGrupo: number;
  compraNegociacaoGrupoMigracaoBudget: CnMigracaoBudgetPayloadGrupo[];
}

export interface CnMigracaoBudgetPayloadGrupo {
  idCompraNegociacaoGrupoOrigem: number;
  valor: number;
}
