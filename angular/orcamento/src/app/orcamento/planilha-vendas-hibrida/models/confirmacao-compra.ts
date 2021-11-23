export interface GrupoConfirmacaoCompra {
  idCompraNegociacaoGrupoConfirmacaoCompra: number;
  idConfirmacaoCompraLegado: number;
  numeracao: string;
  idCompraNegociacaoGrupo: number;
  idGrupo: number;
  codigo: string;
  nome: string;
  idCompraNegociacaoGrupoMapaFornecedor: number;
  valorTotalNegociado: number;
  valorTotalMedido: number;
  percentualTotalMedido: number;
  valorTotalSaldo: number;
  haTransacoesPendentes: true;
  itens: GrupoConfirmacaoCompraItens[];
}

export interface GrupoConfirmacaoCompraItens {
  idCompraNegociacaoGrupoConfirmacaoCompraItem: number;
  idConfirmacaoCompraMedicaoItem: number;
  descricaoPropostaItem: string;
  numeracaoPropostaItem: string;
  tag: string;
  unidade: string;
  quantidade: number;
  valorMedicao: number;
  valorUnitario: number;
  valorTotal: number;
  valorSaldo: number;
  valorTransferido: number;
  valorOriginal: number;
  percentualMedicao: number;
}
