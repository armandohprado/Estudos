export interface ItemFornecedor {
  idPropostaItem: number;
  idProposta: number;
  idOrcamentoGrupoItem: number;
  numeracaoPropostaItem: string;
  descricaoPropostaItem: string;
  valorUnitarioProdutoPropostaItem: number;
  valorUnitarioServicoPropostaItem: number;
  idPropostaItemStatus?: any;
  comentarioPropostaItem?: any;
  quantidadeItens: number;
  idPropostaItemSelecionado: any;
  valorUnitario: number;
  valorTotal: number;
  tag: string;
  gravado: boolean;
  itemSelecionado: boolean;

  variacaoPercentualQuantidade: number;
  excedeuReferenciaQuantidade: boolean;

  variacaoPercentualValorUnitario: number;
  excedeuReferenciaValorUnitario: boolean;

  variacaoPercentualTotal: number;
  excedeuReferenciaTotal: boolean;

  exibirComentarioCompleto: boolean;
  contemItemOmisso: boolean;
  omisso?: boolean;

  atributo1: string;
  atributo2: string;
  atributo3: string;
  atributo4: string;
  complemento: string;
}
