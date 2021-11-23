import { GrupoItemAtributo } from './grupo-item-atributo';
import { GenericResponse } from './generic-response';
import { Quantitativo } from '../shared/de-distribuir-quantitativo/model/quantitativo';
import { ErrorApi } from './error-api';
import { GrupoItemPesquisaReferencia } from './grupo-item-pesquisa-referencia';
import { AwInputStatusProperty } from '@aw-components/aw-input/aw-input.type';

export interface GrupoItem {
  idGrupo: number;
  idGrupoItem: number;
  idOrcamentoGrupo: number;
  idOrcamentoGrupoItem: number;
  numeracao: string;
  numeracaoGrupoItem: string;
  descricaoGrupoItem: string;
  ordenacao: number;
  classificacao: number;
  idUnidade: number;
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
  ativo: boolean;
  fornecedores: OrcamentoGrupoItemFornecedor[];
  statusProperty?: AwInputStatusProperty<any>;
  editingProperty?: Record<string, any>;
}
export type ValidacaoGrupoItem = Pick<
  GrupoItem,
  'idOrcamentoGrupo' | 'idOrcamentoGrupoItem' | 'numeracaoGrupoItem' | 'descricaoGrupoItem'
>;

export interface GrupoItemFilhoProdutoKit {
  kit: string;
  produto: string;
}

export interface GrupoItemFilho {
  id: number;
  numeracao: string;
  numeracaoGrupoItem: string;
  descricao: string;
  descricaoInsumo: string;
  quantidade: number;
  coeficiente: number;
  valorProduto: number;
  valorServico: number;
  valorTotal: number;
  idOrcamentoGrupoItem: number;
  itemHabilitaAmbiente: boolean;
  duplicaFilho: boolean;
  campoCalculado: number;
  produtoKit: GrupoItemFilhoProdutoKit[];
  idProjetoAmbiente: number | null;
  ordem: number;
}

export interface GrupoItemDE extends GrupoItem {
  idsFornecedores: number[];
  loadingFornecedores?: boolean;
  loading?: boolean;
  duplicarLoading?: boolean;
  opened?: boolean;
  atributos?: GrupoItemAtributo[];
  activeMode?: GrupoItemMode;
  activeTab?: GrupoItemTab;
  errorApi?: ErrorApi;
  quantitativo?: Quantitativo;
  pesquisaReferencia?: GrupoItemPesquisaReferencia;
}

export interface OrcamentoGrupoItemFornecedor {
  idFornecedor: number;
  idOrcamentoGrupoItem: number;
  idOrcamentoGrupoItemFornecedor: number;
  nomeFantasia: string;
}

export type GrupoItemMode = 'atributos' | 'pesquisa';
export type GrupoItemTab =
  | 'atributo1'
  | 'atributo2'
  | 'atributo3'
  | 'atributo4'
  | 'complemento'
  | 'distribuir'
  | 'eap-cliente';

export interface GrupoItemGenericReponse {
  orcamentoGrupoItem: GrupoItem;
  responseMessage: GenericResponse;
}
