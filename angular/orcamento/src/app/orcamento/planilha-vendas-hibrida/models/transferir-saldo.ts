export interface PlanilhaHibridaTransferirSaldoDto {
  idCompraNegociacaoGrupo: number;
  valor: number;
}

export interface PlanilhaHibridaTransferirSaldoCC {
  idCompraNegociacaoGrupo: number;
  idConfirmacaoCompra: number;
  idConfirmacaoCompraItem: number;
  valorTransferido: number;
  valorOriginal: number;

  // INFORMAÇÕES DO MAPA ENVIADO
  compraNegociacaoStatus?: string;
  data?: Date;
  dataEfetivacao?: Date;
  idCompraNegociacaoGrupoFicha?: number;
  idCompraNegociacaoGrupoTransacaoConfirmacaoCompraItem?: number;
  idCompraNegociacaoStatus?: number;
  idPlanilhaHibrida?: number;
  codigo?: string;
  nome?: string;
  idGrupo?: number;
}
