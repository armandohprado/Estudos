import { AwInputStatus } from '../../aw-components/aw-input/aw-input.type';

export interface Item {
  descontoUnitarioProduto?: number;
  descontoUnitarioServico?: number;
  descricao: string;
  idCondominio: number;
  classificacao: number;
  idEdificio: number;
  idEdificioPavimento: number;
  idFornecedorSubProduto: number;
  idFornecedorSubServico: number;
  idOrcamentoGrupoItem: number;
  idPavimento: number;
  idProjetoEdificioPavimento: number;
  idProposta: number;
  idPropostaItem: number;
  idPropostaItemStatus: number;
  numeracao: string;
  observacao?: string;
  comentarioPropostaItem?: string;
  orcado: boolean;
  quantidade: number;
  tag: string;
  unidadeMedida: string;
  idUnidade: number;
  valorTotal?: number;
  valorTotalProduto?: number;
  valorTotalServico?: number;
  valorTotalDesconto?: number;
  valorTotalProdutoDesconto?: number;
  valorTotalServicoDesconto?: number;
  tipo?: string;
  open: boolean;
  valorUnitarioProduto: number;
  valorUnitarioServico: number;
  loadingFornecedor: boolean;
  exibirCamposFornecedor: boolean;
  exibirCamposDesconto: boolean;
  loadingAplicarDesconto: boolean;
  loader: boolean;
  omisso: boolean;
  status: Partial<
    {
      [K in keyof StatusItem]: AwInputStatus;
    }
  >;
  atributos?: AtributosItem;
  propostaItemQuantitativo?: PropostaItemQuantitativo[];
}

export type StatusItem = Pick<
  Item,
  | 'comentarioPropostaItem'
  | 'observacao'
  | 'descricao'
  | 'unidadeMedida'
  | 'loadingFornecedor'
  | 'valorUnitarioProduto'
  | 'valorUnitarioServico'
  | 'descontoUnitarioProduto'
  | 'descontoUnitarioServico'
  | 'idFornecedorSubProduto'
  | 'idFornecedorSubServico'
>;

export interface AtributosItem {
  atributo1: string;
  atributo2: string;
  atributo3: string;
  atributo4: string;
  complemento: string;
  descontoUnitarioProduto: number;
  descontoUnitarioServico: number;
  idFornecedorSubProduto: number;
  idFornecedorSubServico: number;
  idOrcamentoGrupoItem?: number;
  idOrcamentoGrupoItemPai?: number;
  idProposta: number;
  idPropostaItem: number;
  idPropostaItemStatus: number;
  nomeFantasiaSubFornecedorProduto: string;
  nomeFantasiaSubFornecedorServico: string;
  observacao: string;
  comentarioPropostaItem: string;
  subFornecedores: [];
  valorUnitarioProduto: number;
  valorUnitarioServico: number;
}

export interface PropostaItemQuantitativo {
  idProposta: number;
  idPropostaItemQuantitativo: number;
  idPropostaItem: number;
  idFase: number;
  idProjetoEdificioPavimento: number;
  idProjetoCentroCusto: number;
  quantidade: number;
}

export interface Atributos {
  idOrcamentoGrupoItemAtributo: number;
  idOrcamentoGrupoItem: number;
  idGrupoItemDadoAtributo: number;
  descricao: string;
}
