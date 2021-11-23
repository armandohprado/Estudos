import { ContatoAlt, Funcionario, GrupoAlt } from '../../models';
import { CnMapa } from './cn-mapa';
import { GrupoTransferencia } from '@aw-models/controle-compras/grupo-transferencia';
import { CnConfirmacaoCompra, CnConfirmacaoCompraFornecedor } from './cn-confirmacao-compra';
import { CnFornecedor } from './cn-fornecedor';
import { CnEmitirCc } from './cn-emitir-cc';
import { CnTransacoesAtual } from './cn-transacoes-atual';
import { CnHistoricoMapa } from './cn-historico-mapa';
import { CnClassificacao } from './cn-classificacao';
import { PlanilhaHibridaTransferirSaldoCC } from '../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { CnFichaAlt } from './cn-ficha-alt';
import { PlanoCompraQuestao } from '@aw-models/plano-compra-questao';
import { CnMigracaoBudgetGrupo } from './cn-migracao-budget-grupo';
import { CnMigracaoBudgetGrupoResumo } from './cn-migracao-budget-resumo';

export interface CompraNegociacaoGrupo {
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
  grupoTaxa: boolean;
  idOrcamentoCenarioGrupoContrato: number;
  valorMiscellaneous: number;
  percentualImposto: number;
  valorMargemRevenda: number;
  valorSaldo: number;
  valorSaldoContingenciaReservado: number;
  valorMiscellaneousReservado: number;
  dataCarga: string;
  dataUltimaAlteracao: string;
  haTransacoesPendentes?: boolean;
  valorSaldoTransferido?: number;
  valorSaldoTransferidoChangeOrder: number;
  comentarioCompras: string;
  dataPlanejamentoBatidaMartelo: string;
  dataPlanejamentoEmissaoCC: string;
  dataPlanejamentoInclusaoPO: string;
  valorSaldoReservadoChangeOrder: number;
  responsaveis: Funcionario[];
  centralCompras: boolean;
  dataAprovacaoMapa: string;
  liberaFichaDispensa: boolean;
  grupoNaoPrevisto: boolean;
  grupoNaoAlterado: boolean;
  idOrcamentoGrupoOrigem: number;
  complementoOrcamentoGrupo: string;
  numeracao?: string;
  flagControleSD: boolean;
  valorMiscellaneousDisponivel: number;
}

export interface CnGrupo extends CompraNegociacaoGrupo {
  valorUtilizado: number;
  valorImposto: number;
  confirmacaoCompraFornecedores?: CnConfirmacaoCompraFornecedor[];
  confirmacaoCompraMiscellaneous?: CnConfirmacaoCompraFornecedor[];
  confirmacaoCompraRevenda?: CnConfirmacaoCompraFornecedor[];
  confirmacaoCompra?: CnConfirmacaoCompra;
  confirmacaoCompraContatos?: ContatoAlt[];
  confirmacaoCompraModo?: CnConfirmacaoCompraModo;
  confirmacaoCompraEmitidoRevenda?: number;
  confirmacaoCompraSaldoRevenda?: number;
  classificacoes?: CnClassificacao[];
  classificacoesRevenda?: CnClassificacao[];
  emitirCc?: CnEmitirCc;
  tipo?: CnTipoGrupoEnum;
  tabAtual?: CnGruposTabsEnum;
  loadingCompraNegociacaoTab?: boolean;
  gruposTransferencia?: GrupoTransferencia[];
  gruposTransferenciaCC?: PlanilhaHibridaTransferirSaldoCC[];
  gruposFornecedores?: CnFornecedor[];
  grupoFornecedorMenorValor?: CnFornecedor;
  mapaAtual?: CnMapa;
  refreshingGrupoAtual?: boolean;
  grupoTaxa: boolean;
  historicoMapa?: CnHistoricoMapa[];
  transacoesAtual?: CnTransacoesAtual;
  visualizarMapa?: CnMapa;
  collapseMapa?: boolean;
  collapseTransacao?: boolean;
  valorSaldoAtualizado?: number;
  trocandoMapa?: boolean;
  permitidoEmitirCcSemMapa?: boolean;
  necessidadeAberturaFichaEstouro?: boolean;
  loading?: boolean;
  grupoOrcamento?: GrupoAlt;

  formEstouroBudget?: CnGrupoEstouroBudgetForm;
  fichas?: CnFichaAlt[];

  gruposDuplicadosIds?: number[];
  gruposDuplicados?: CnGrupo[];
  isOrigem?: boolean;
  complementoOverlayOpened?: boolean;
  loadingComplementoOverlay?: boolean;

  planoCompraQuestoes?: PlanoCompraQuestao[];

  migracaoBudgetGruposTransferencia?: CnMigracaoBudgetGrupo[];
  loadingMigracaoBudgetGruposTransferencia?: boolean;
  migracaoBudgetGruposResumoRecebido?: CnMigracaoBudgetGrupoResumo[];
  migracaoBudgetGruposResumoCedido?: CnMigracaoBudgetGrupoResumo[];
  migracaoBudgetTotalRecebido?: number;
  migracaoBudgetTotalCedido?: number;
  loadingMigracaoBudgetGruposResumo?: boolean;
}

export enum CnConfirmacaoCompraModo {
  Fornecedor = 'Fornecedor',
  Miscellaneous = 'Miscellaneous',
  Revenda = 'Revenda',
}

export interface CnGrupoEstouroBudgetForm {
  detalhe: string;
  origemEstouro: number;
}

export enum CnGruposTabsEnum {
  Orcamento,
  CompraNegociacao,
  MigracaoBudget,
  Confirmacao,
}
export enum CnTipoGrupoEnum {
  Direto = 'Direto',
  Refaturado = 'Refaturado',
}

export type KeyofCcGrupos = keyof CnGrupo;
