import { trackByFactory } from '@aw-utils/track-by';

export interface DuplicarGrupoItem {
  idOrcamentoGrupoItem: number;
  atributos: boolean;
  quantidades: boolean;
  valorReferencia: boolean;
  comentario: boolean;
  produtoCatalogo?: boolean;
  todos: boolean;
  numeroCopias: number;
}

export type DuplicarGrupoItemKeys = Omit<DuplicarGrupoItem, 'idOrcamentoGrupoItem'>;
export interface DuplicarGrupoItemKeysArray {
  key: keyof DuplicarGrupoItemKeys;
  value: string;
  control: boolean;
}

export const duplicarKeys: DuplicarGrupoItemKeysArray[] = [
  { key: 'atributos', value: 'Atributos', control: false },
  { key: 'quantidades', value: 'Quantidades', control: false },
  { key: 'valorReferencia', value: 'Valor referência', control: false },
  { key: 'comentario', value: 'Comentário', control: false },
  { key: 'todos', value: 'Todos', control: false },
  { key: 'produtoCatalogo', value: 'Produtos', control: false },
];

export const getDuplicarKeys = () => [...duplicarKeys].map(o => ({ ...o }));
export const trackByDuplicarKeys = trackByFactory<DuplicarGrupoItemKeysArray>('key');
