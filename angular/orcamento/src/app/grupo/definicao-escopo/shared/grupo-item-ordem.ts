import { OrderByType } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { GrupoItem } from '../model/grupo-item';
import { orderByNumeracao } from '@aw-utils/grupo-item/sort-by-numeracao';

export enum GrupoItemOrdem {
  numeroItem,
  codItem,
}

export interface GrupoItemOrdemCombo<T extends GrupoItem> {
  key: GrupoItemOrdem;
  label: string;
  order: OrderByType<T>;
}

export function getGrupoItemOrdemComboArray<T extends GrupoItem>(): GrupoItemOrdemCombo<T>[] {
  return [
    { key: GrupoItemOrdem.numeroItem, label: 'Número do Item', order: orderByNumeracao() },
    { key: GrupoItemOrdem.codItem, label: 'Cód. Item', order: orderByNumeracao(true) },
  ];
}
