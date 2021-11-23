export interface TransferenciaCC {
  idOrcamento: number;
  idOrcamentoCenario: number;
  nomeOrcamentoCenario: string;
  contratoPrincipal: boolean;
  collapse?: boolean;
  familias: FamiliaTransferenciaCC[];
}

export interface GruposTransferenciaCC {
  idCompraNegociacaoGrupoConfirmacaoCompra: number;
  idConfirmacaoCompraLegado: number;
  idCompraNegociacaoGrupoMapaFornecedor: number;
  idCompraNegociacaoGrupo: number;
  idGrupo: number;
  codigo: string;
  nome: string;
  idFornecedor: number;
  nomeFantasia: string;
  valorTotalNegociado: number;
  valorUtilizado: number;
  valorSaldo: number;
  haTransacoesPendentes: boolean;
  idTipoConfirmacaoCompra: number;
}

export interface FamiliaTransferenciaCC {
  idOrcamentoFamilia: number;
  nomeOrcamentoFamilia: string;
  collapse?: boolean;
  grupos: GruposTransferenciaCC[];
}
