export interface Desconto {
  idFornecedor: number;
  nomeFantasia: string;
  principal: boolean;
  qtdItensOrcados: number;
  qtdItens: number;
  valorTotalProduto: number;
  valorTotalProdutoSemDesconto: number;
  valorTotalServico: number;
  valorTotalServicoSemDesconto: number;
  valorTotal: number;
  idProposta: number;
  descontoProduto: number;
  descontoServico: number;
  descontoRealProduto?: number;
  descontoRealServico?: number;
  descontoGeralRealProduto?: number;
  descontoGeralRealServico?: number;
  valorTotalTela: number;
}
