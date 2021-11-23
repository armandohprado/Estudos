import { PropostaAltFornecedor } from '@aw-models/proposta-alt-fornecedor';

export interface PropostaAlt {
  idProposta: number;
  idFornecedor: number;
  fornecedor: PropostaAltFornecedor;
  possuiConfirmacaoCompra: boolean;
  possuiMapaEnviado: boolean;
  lastCall: boolean;
  desativaProposta: boolean;
  versaoProposta: number;
  status: string;
  preenchida: boolean;
  declinadaProposta: boolean;
  valorParcialProposta: number;
  valorTotalProposta: number;
  valorTotalProdutoProposta: number;
  valorTotalServicoProposta: number;
  prazoEntrega?: Date;
  prazoExecucao?: Date;
  dataSolicitacaoProposta?: Date;
  dataRetornoProposta?: Date;
  declinadaPropostaNome?: string;
  declinadaPropostaMotivo?: string;
  desatualizadoProposta: boolean;
  idContatoFornecedor?: number;
  comentarioProposta?: string;

  // Custom
  equalizacaoSelecionada?: boolean;
  idOrcamentoGrupo: number;
  idOrcamentoFamilia: number;
}
