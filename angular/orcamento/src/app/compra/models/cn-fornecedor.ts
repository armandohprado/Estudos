export interface CnFornecedor {
  idCompraNegociacaoGrupoMapaFornecedor: number;
  idCompraNegociacaoGrupoMapa: number;
  idProposta: number;
  idFornecedor: number;
  idCompraNegociacaoStatus: number;
  nomeFantasia: string;
  lastCall: boolean;
  favorito: boolean;
  valorTotalOrcado: number;
  valorTotalSelecionado: number;
  valorTotalNegociado: number;
  valorTotalImpostoRevenda: number;
  valorTotalRevenda: number;
  emitirMapaEmissaoCompra: boolean;
  emitirMapaEmissaoCompraMensagem: string;
  itemOmisso: boolean;
  bloquearEmissao: boolean;
  mapaEmitido: boolean;

  selecionado?: boolean;
}
