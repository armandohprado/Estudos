export interface CnMigracaoGrupo {
  idCompraNegociacaoGrupo: number;
  idCompraNegociacaoStatus: number;
  compraNegociacaoStatus: string;
  idGrupo: number;
  codigo: string;
  nome: string;
  valorVendaCongelada: number;
  valorMetaCompra: number;
  percentualImposto: number;
  valorMaximoCompra: number;
  grupoTaxa: boolean;
  haTransacoesPendentesOuCOEmitida: boolean;
  idOrcamentoCenarioGrupoContrato: number;
  awProduto: boolean;
}

export interface CnMigracaoGrupoPayload {
  valorNovaMeta: number;
  idCompraNegociacaoGrupo: number;
  idOrcamentoCenarioGrupoContrato: number;
  awProduto: boolean;
  percentualImposto: number;
}
