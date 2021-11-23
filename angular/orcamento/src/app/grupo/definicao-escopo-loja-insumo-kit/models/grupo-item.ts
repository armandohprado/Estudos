import { GrupoItem, GrupoItemFilho } from '../../definicao-escopo/model/grupo-item';
import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { AwInputStatusProperty } from '@aw-components/aw-input/aw-input.type';
import { Quantitativo } from '../../definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';
import { FiltroProdutoCatalogo } from '../../definicao-escopo-loja-insumo/models/produto-catalogo';
import { Kit } from './kit';
import { GrupoItemDELITab } from '../../definicao-escopo-loja-insumo/models/grupo-item';

export interface GrupoItemKit extends GrupoItem {
  loading?: boolean;
  statusProperty?: GrupoItemKitStatusProperty;
  editingProperty?: GrupoItemKitEditProperty;
  errorApi?: ErrorApi;
  opened?: boolean;
  duplicar?: boolean;
  quantitativo?: Quantitativo;
  catalogo?: Kit[];
  produtos?: Kit[];
  openedCatalogo?: boolean;
  activeTab?: string;
  tabSelectedIndex?: number;
  filhos?: GrupoItemKitFilho[];
  filtros?: FiltroProdutoCatalogo[];
  term?: string;
  activeTabQuantificar?: GrupoItemDELITab;
}

export interface GrupoItemKitFilho extends GrupoItemFilho {
  loading?: boolean;
  opened?: boolean;
  statusProperty?: GrupoItemKitFilhoStatusProperty;
}

export interface GrupoItemKitFilhoGrouped {
  descricao: string;
  itens: GrupoItemKitFilho[];
}

export type KeyofGrupoItemKit = keyof GrupoItemKit;
export type KeyofGrupoItemKitFilho = keyof GrupoItemKitFilho;
export type GrupoItemKitStatusProperty = AwInputStatusProperty<GrupoItemKit>;
export type GrupoItemKitFilhoStatusProperty = AwInputStatusProperty<GrupoItemKitFilho>;
export type GrupoItemKitEditProperty = Partial<Record<keyof GrupoItemKit, boolean>>;
export type GrupoItemKitID = 'idOrcamentoGrupoItem' | 'idGrupoItem';
