export interface AtualizarItem {
  idProposta: number;
  idPropostaItem: number;
  descricao: string;
  idProjetoEdificioPavimento: number;
  idFornecedorSubServico: number;
  idFornecedorSubProduto: number;
  valorUnitarioProduto: number;
  descontoUnitarioProduto: number;
  valorUnitarioServico: number;
  descontoUnitarioServico: number;
  observacao: string;
  idPropostaItemStatus: number;
  idUnidade: number;
}
export interface AtualizarQuantitativo {
  idFase: number;
  idProjetoEdificioPavimento: number;
  idProjetoCentroCusto: number;
  idProposta: number;
  idPropostaItem: number;
  idPropostaItemQuantitativo: number;
  quantidade: number;
  quantidadeOrcada: number;
}

export interface AdicionarOmisso {
  idUnidade: number;
  quantidade: number;
  descricao: string;
  valorUnitarioProduto: number;
  valorUnitarioServico: number;
  idPropostaItemStatus: number;
  idPropostaItem: number;

  unidadeMedida?: string;
  idFornecedorSubServico?: number;
  valorTotal?: number;
  idFornecedorSubProduto?: number;
  idProposta?: number;
  observacao?: string;
  descontoUnitarioProduto?: number;
  descontoUnitarioServico?: number;
}
