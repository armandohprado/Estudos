import { OrcamentoGrupoItem } from './orcamentoGrupoItem';

export interface GrupoItem {
  idGrupo: number;
  idGrupoItem: number;
  idOrcamentoGrupo: number;
  idOrcamentoGrupoItem: number;
  numeracao: string;
  numeracaoGrupoItem: string;
  descricaoGrupoItem: string;
  ordenacao: string;
  unidadeMedida: string;
  quantidadeTotal: number;
  valorUnitarioProdutoReferencia: number;
  valorUnitarioServicoReferencia: number;
  valorTotal: number;
  atributo1: string;
  atributo2: string;
  atributo3: string;
  atributo4: string;
  complemento: string;
  tag: string;
  idGrupoItemPai: number;
  itemPai: boolean;
  idUnidade: number;
  ativo: boolean;
  grupoItemAtributo: any[];
  orcamentoGrupoItem: OrcamentoGrupoItem[];
  checkInput?: boolean;
  atributos?: boolean;
  quantidade?: boolean;
  valor?: boolean;
  comentario?: boolean;
  todos?: boolean;
  duplicarAtivo?: boolean;
  listaGrupo?: any[];
  listaProjeto?: any[];
  pesquisaShow?: boolean;
  pesquisaProjeto?: any;
}

export interface GrupoItemValoresTag
  extends Partial<
    Pick<
      GrupoItem,
      | 'tag'
      | 'valorUnitarioServicoReferencia'
      | 'valorUnitarioProdutoReferencia'
    >
  > {}
