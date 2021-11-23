import { CnTransacao } from './cn-transacao';

export interface CnTransacoesAtual {
  idCompraNegociacaoGrupo: number;
  idCompraNegociacao: number;
  idOrcamento: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenario: number;
  idPlanoCompraGrupo: number;
  idPlanilhaHibrida: number;
  idCompraNegociacaoStatus: number;
  compraNegociacaoStatus: string;
  idGrupo: number;
  codigo: string;
  nome: string;
  valorVendaCongelada: number;
  valorCompraCongelada: number;
  valorEmissaoCC: number;
  valorSaldoContingencia: number;
  valorMetaCompra: number;
  valorLimiteCompra: number;
  percentualImposto: number;
  grupoTaxa: boolean;
  idOrcamentoCenarioGrupoContrato: number;
  compraNegociacaoGrupoExtratoTransacao: CnTransacao[];

  idPlanilhaHibridaDestinoTransferenciaCO: number;
  liberaFichaDispensa: boolean;
  centralCompras: boolean;
  valorMargemRevenda: number;
  valorMiscellaneous: number;
  valorMiscellaneousReservado: number;
  valorSaldo: number;
  valorSaldoContingenciaReservado: number;
  valorSaldoReservadoChangeOrder: number;
  valorSaldoTransferido: number;
  valorSaldoTransferidoChangeOrder: number;
  haTransacoesPendentes: boolean;
  dataCarga: string;
  dataUltimaAlteracao: string;
  grupoNaoPrevisto: boolean;
  grupoNaoAlterado: boolean;
}
