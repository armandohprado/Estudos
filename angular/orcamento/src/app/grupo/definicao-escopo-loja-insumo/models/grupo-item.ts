import { GrupoItem, GrupoItemFilho } from '../../definicao-escopo/model/grupo-item';
import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { AwInputStatusProperty } from '@aw-components/aw-input/aw-input.type';
import { FiltroProdutoCatalogo, ProdutoCatalogo } from './produto-catalogo';
import { Quantitativo } from '../../definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';

export enum GrupoItemDELITab {
  quantificar,
  eapCliente,
}

export interface GrupoItemDELI extends GrupoItem {
  loading?: boolean;
  statusProperty?: GrupoItemDELIStatusProperty;
  editingProperty?: GrupoItemDELIEditProperty;
  errorApi?: ErrorApi;
  opened?: boolean;
  duplicar?: boolean;
  quantitativo?: Quantitativo;
  filhos?: GrupoItemDELIFilho[];
  openedQuantitativo?: boolean;
  activeTab?: GrupoItemDELITab;
}

export interface GrupoItemDELIFilho extends GrupoItemFilho {
  loading?: boolean;
  opened?: boolean;

  catalogo?: ProdutoCatalogo[];
  produtos?: ProdutoCatalogo[];
  openedCatalogo?: boolean;
  statusProperty?: GrupoItemDELIFilhoStatusProperty;

  errorApi?: ErrorApi;

  filtros?: FiltroProdutoCatalogo[];
  term?: string;
}

export interface GrupoItemDELIFilhoGrouped {
  descricao: string;
  itens: GrupoItemDELIFilho[];
}

export type KeyofGrupoItemDELI = keyof GrupoItemDELI;
export type KeyofGrupoItemDELIFilho = keyof GrupoItemDELIFilho;
export type GrupoItemDELIStatusProperty = AwInputStatusProperty<GrupoItemDELI>;
export type GrupoItemDELIFilhoStatusProperty = AwInputStatusProperty<GrupoItemDELIFilho>;
export type GrupoItemDELIEditProperty = Partial<Record<keyof GrupoItemDELI, boolean>>;
export type GrupoItemDELIID = 'idOrcamentoGrupoItem' | 'idGrupoItem';
