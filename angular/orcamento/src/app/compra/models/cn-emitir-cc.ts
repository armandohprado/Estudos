import { PlanoCompraQuestaoPayload } from '@aw-models/plano-compra-questao';

export interface CnEmitirCc {
  nome: string;
  codigo: string;
  idGrupo: number;
  idCompraNegociacaoGrupo: number;
  pavimentos: CnEmitirCcPavimento[];
  emitirNF: CnEmitirCcTipificacao[];
  valorTotal: number;
  nomeContato: string;
  idContato: number;
  contato: CnEmitirCcContato;
  idProposta: number;
  nomeFantasia: string;
  cnpj: string;

  valorTotalCN: number;
  idFaturamentoCobranca: number;
  valorSaldo: number;
  bloqueioCN: boolean;
  versaoProposta: number;
  idProjeto: number;
  nomeResponsavelProposta: string;
  compraNegociacaoStatus?: any;
  idCompraNegociacaoStatus: number;
  idCompraNegociacaoGrupoMapaFornecedor: number;
  idCompraNegociacaoGrupoMapa: number;

  valorSaldoComTransferencias: number;
}

export interface CnEmitirCcContato {
  idContato: number;
  nome: string;
}

export interface CnEmitirCcTipificacao {
  idTipificacao: number;
  nome: string;
}

export interface CnEmitirCcPavimento {
  idProjetoEdificioPavimento: number;
  tipoPavimento: string;
  nomePavimento: string;
  valorTotal: number;
  centrosCustos: CnEmitirCcCentroCusto[];
}

export interface CnEmitirCcCentroCusto {
  idProjetoCentroCusto: number;
  descricaoProjetoCentroCusto: string;
  principal: boolean;
  valorTotal: number;
  itens: CnEmitirCcPavimentoItem[];
}

export interface CnEmitirCcPavimentoItem {
  idPropostaItem: number;
  numeracao: string;
  descricao: string;
  tag: string;
  atributo1?: string;
  atributo2?: string;
  atributo3?: string;
  atributo4?: string;
  complemento?: string;
  valorTotal: number;
}

export interface CnEmitirCcPayload {
  idCompraNegociacaoGrupo: number;
  idCompraNegociacaoGrupoMapaFornecedor: number;
  idConfirmacaoCompraClassificacao: number;
  idEmpresaFaturamento: number;
  idFornecedorContato: number;
  prazoEntregaObra: number;
  prazoExecucaoObra: number;
  condicaoPagamento: string;
  numeroInternoCliente: string;
  cepDocumento: string;
  enderecoDocumento: string;
  complementoDocumento: string;
  bairroDocumento: string;
  idCidadeDocumento: number;
  idEstadoDocumento: number;
  idPaisDocumento: number;
  cepEntrega: string;
  enderecoEntrega: string;
  complementoEntrega: string;
  bairroEntrega: string;
  idCidadeEntrega: number;
  idEstadoEntrega: number;
  idPaisEntrega: number;
  observacao: string;
  idGrupo: number;
  idProjeto: number;
  planoCompraQuestoes: PlanoCompraQuestaoPayload[];
  dataFluxoSD?: Date;
}

export interface CnEmitirCcPayloadMiscellaneous extends CnEmitirCcPayload {
  valorSaldoContingencia?: number;
  valorMargemRevenda?: number;
}

export interface CnEmitirCcPayloadSemMapa extends CnEmitirCcPayload {
  valorSaldoContingencia?: number;
  valorMiscellaneous?: number;
}

export interface CnEmitirCcPayloadRevenda extends CnEmitirCcPayload {
  valorMargemRevenda: number;
}
