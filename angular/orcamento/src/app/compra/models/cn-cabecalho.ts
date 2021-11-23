export interface CnCabecalho {
  idCompraNegociacao: number;
  idOrcamentoCenario: number;
  valorTotalVendaCongelada: number;
  valorTotalEmissaoCC: number;
  valorTotalProjecao: number;
  valorSaldoContingencia: number;
  valorTotalMargemVendaCongelada: number;
  valorTotalMargemEmissaoCC: number;
  valorTotalMargemProjecao: number;
  valorTotalMargemSaldoContingencia: number;
  valorTotalMetaCompra: number;
  valorTotalMetaMiscellaneous: number;
  percentualMargemVendaCongelada: number;
  percentualMargemEmissaoCC: number;
  percentualMargemProjecao: number;
  percentualMargemSaldoContingencia: number;
  valorTotalMiscellaneous: number;

  valorTotalSaldo: number;
  valorTotalSaldoContingencia: number;
  valorTotalSaldoContingenciaReservado: number;
  valorTotalMiscellaneousReservado: number;
  valorTotalLimiteCompra: number;
  dataCarga: string;
  dataUltimaAlteracao: string;
  idPlanoCompra: number;
}
