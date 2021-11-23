export interface ListaProposta {
  ambiente: string;
  itens: PropostaItem[];
  idAmbienteTemp: number;
}

export interface PropostaItem {
  idPropostaItem: number;
  sequencia: string;
  tag: string;
  descricao: string;
  observacao: string;
  unidadeMedida: string;
  quantidade: number;
  produtoValorUnitario: number;
  produtoPercentualDesconto: number;
  produtoDescontoUnidade: number;
  produtoSubTotal: number;
  produtoFornecedor?: string;
  servicoValorUnitario: number;
  servicoPercentualDesconto: number;
  servicoDescontoUnidade: number;
  servicoSubTotal: number;
  servicoFornecedor?: string;
  total: number;
  idFase: number;
  idProjetoCentroCusto: number;
  idPropostaItemQuantitativo: number;
  idProjetoEdificioPavimento: number;
  itemOmisso: boolean;
  liberarQuantitativoReferencia: boolean;
  quantitativoReferencia: number;

  idFaseTemp: number;
  idAmbienteTemp: number;
}
export interface FasesListaProposta {
  nomeFase: string;
  listaPropostas: ListaProposta[];
  descontoProduto?: number;
  descontoServico?: number;
  liberarQuantitativo?: boolean;
  idFaseTemp: number;
}

export interface InformacaoProposta {
  idPavimento: number;
  valorProduto: number;
  descontoProduto: number;
  valorServico: number;
  descontoServico: number;
  andarAtual?: string;
}

export interface Atributos {
  idProposta: number;
  idPropostaItem: number;
  idOrcamentoGrupoItem: number;
  idOrcamentoGrupoItemPai?: any;
  idFornecedorSubServico: number;
  idFornecedorSubProduto: number;
  idPropostaItemStatus: number;
  atributo1?: any;
  atributo2?: any;
  atributo3?: any;
  atributo4?: any;
  observacao: string;
  complemento?: any;
  nomeFantasiaSubFornecedorProduto?: any;
  nomeFantasiaSubFornecedorServico?: any;
}
