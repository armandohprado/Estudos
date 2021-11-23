export interface CnMigracaoBudgetResumoResponse {
  budgetRecebido: CnMigracaoBudgetGrupoResumo[];
  budgetCedido: CnMigracaoBudgetGrupoResumo[];
}

export interface CnMigracaoBudgetGrupoResumo {
  idCompraNegociacaoGrupoMigracaoBudget: number;
  idCompraNegociacaoGrupoOrigem: number;
  idCompraNegociacaoGrupoDestino: number;
  nomeGrupo: string;
  codigoGrupo: string;
  valorTransferido: number;
  idCompraNegociacaoGrupo: number;
  idFuncionario: number;
  codigoGrupoOrigem: string;
  nomeGrupoOrigem: string;
  nomeFuncionario: string;
  data: Date;
}
