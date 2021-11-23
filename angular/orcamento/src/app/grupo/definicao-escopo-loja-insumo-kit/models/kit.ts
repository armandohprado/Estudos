import { FiltroProdutoCatalogo } from '../../definicao-escopo-loja-insumo/models/produto-catalogo';
import { isNil } from 'lodash-es';

export interface Kit {
  idKit: number;
  idFornecedor: number;
  idOrcamentoGrupoItemKit: number;
  nomeFornecedor: string;
  nome: string;
  descricao: string;
  precoFabricaSP: number;
  precoFabricaRJ: number;
  moeda: string;
  prazoEntrega: string;
  caminhoFisicoImagem: string;
  precoRegiao: number;
  projetoRegiao: string;
  filtros: FiltroProdutoCatalogo[];

  // CUSTOM
  selecionado?: boolean;
  selecionadoCatalogo?: boolean;
  loading?: boolean;
}

export interface KitPayload {
  idOrcamentoGrupoItemKit: number;
  idKit: number;
  idOrcamentoGrupoItem: number;
  selecionado: boolean;
  idFornecedor: number;
}

export function isKit(value: any): value is Kit {
  return !isNil(value?.idKit);
}
