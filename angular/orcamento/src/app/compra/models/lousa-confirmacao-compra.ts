export interface LousaConfirmacaoCompra {
  idConfirmacaoCompra: number;
  numeracao: string;
  idFornecedor: number;
  nomeFantasia: string;
  idConfirmacaoCompraClassificacao: number;
  nomeConfirmacaoCompraClassificacao: string;
  valorContratado: number;
  percentualValorContratado: number;
  dataEmissaoCC?: Date;

  urlCentralizacao: string;
}
