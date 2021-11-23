import { EpPropostaItemQuantitativoItem } from './item-quantitativo';

export interface EpPropostaItem {
  idFornecedor: number;
  idPropostaItem: number;
  idProposta: number;
  idOrcamentoGrupoItem: number;
  numeracaoPropostaItem: string;
  descricaoPropostaItem: string;
  valorUnitarioProdutoPropostaItem: number;
  descontoUnitarioProdutoPropostaItem?: number;
  valorUnitarioServicoPropostaItem: number;
  descontoUnitarioServicoPropostaItem?: number;
  idPropostaItemStatus?: number;
  comentarioPropostaItem?: string;
  quantidadeItens: number;
  contemItemOmisso: boolean;
  idPropostaItemSelecionado?: number;
  valorUnitario: number;
  valorTotal: number;
  tag: string;
  gravado: boolean;
  selecionadoOmisso: boolean;
  atributo1?: string;
  atributo2?: string;
  atributo3?: string;
  atributo4?: string;
  complemento?: string;
  omisso: boolean;
  unidadeMedida: string;
  indicadorAWReferencia?: boolean;
  indicadorAWEstimado?: boolean;

  descricaoCompleta: string;
  descricaoOpened: boolean;
  quantitativoOpened: boolean;
  valorUnitarioOpened: boolean;
  loadingValorUnitario: boolean;
  loadingSelecionar: boolean;
  loadingTransferenciaQuantidade: boolean;
  loadingTransferenciaValorUnitario: boolean;
  loadingTransferenciaValorUnitarioProduto: boolean;
  loadingTransferenciaValorUnitarioServico: boolean;
  loadingQuantitativo: boolean;
  savingOmisso: boolean;
  deletingOmisso: boolean;

  orderOmisso?: number;

  quantitativos: EpPropostaItemQuantitativoItem[];

  columns: EpPropostaItem[];
  itemNaoPreenchido: boolean;
}

export interface EpPropostaItemValorUnitarioPayload {
  valorProduto?: number;
  valorServico?: number;
  awReferencia: boolean;
}

export type EpPropostaItemPropertyComparativo = keyof Pick<
  EpPropostaItem,
  | 'quantidadeItens'
  | 'valorTotal'
  | 'quantitativos'
  | 'valorUnitario'
  | 'valorUnitarioProdutoPropostaItem'
  | 'valorUnitarioServicoPropostaItem'
>;
