import { GenericResponse } from '../../definicao-escopo/model/generic-response';
import { isNil } from 'lodash-es';

export interface ProdutoCatalogo {
  idProdutoCatalogo: number;
  idProduto: number;
  idGrupoItem: number;
  idOrcamentoGrupoItem: number;
  idOrcamentoGrupoItemProdutoCatalogo: number;
  idFornecedor: number;
  idSku?: number;
  nomeFornecedor: string;
  nome: string;
  descricao: string;
  urlImagem: string;
  precoFabricaSP: number;
  precoFabricaRJ: number;
  moeda: string;
  prazoEntrega: string;
  caminhoFisicoImagem: string;
  segmentacao: string;
  precoRegiao: number;
  projetoRegiao: string;
  complemento: boolean;
  selecionado: boolean;
  filtros: FiltroProdutoCatalogo[];
  quantidade?: number;
  selecionadoCatalogo?: boolean;
  loading?: boolean;
  variacoes?: ProdutoCatalogoVariacao[];
  skus?: ProdutoCatalogoSku[];
  maxOptionVariacoes?: number;
  minOptionVariacoes?: number;
}

export interface ProdutoCatalogoSku {
  idSku: number;
  idProduct: number;
  deleted: boolean;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  option5?: string;
  option6?: string;
  option7?: string;
  option8?: string;
  option9?: string;
  option10?: string;
  option11?: string;
  option12?: string;
  option13?: string;
  option14?: string;
  option15?: string;
}

export interface ProdutoCatalogoVariacoesResponse {
  variacoes: ProdutoCatalogoVariacao[];
  variacoesPermitidas: ProdutoCatalogoSku[];
}

export interface FiltroProdutoCatalogo {
  nome: string;
  valor: any;
}

export interface FiltroCatalogo {
  nome: string;
  valores: FiltroValor[];
}

export interface FiltroValor {
  valor: any;
  active: boolean;
  deleted?: boolean;
}

export interface ProdutoCatalogoVariacao {
  optionNumber: number;
  titulo: string;
  valores: string[];
  valoresCustom?: FiltroValor[];
  disabled?: boolean;
}

export interface ProdutoCatalogoVariacaoPayload {
  optionNumber: number;
  valorSelecionado: string;
}

export interface ProdutoCatalogoPayload {
  idOrcamentoGrupoItemProdutoCatalogo: number;
  idOrcamentoGrupoItem: number;
  idProdutoCatalogo: number;
  selecionado: boolean;
  complemento: boolean;
  idFornecedor: number;
}

export interface ProdutoCatalogoGenericResponse {
  responseMessage: GenericResponse;
  produtoCatalogo: ProdutoCatalogo;
}

export function isProdutoCatalogo(value: any): value is ProdutoCatalogo {
  return !isNil(value?.idProdutoCatalogo);
}
