import { GrupoItemDE } from '../../../model/grupo-item';
import { Entity } from '@aw-utils/types/entity';

export interface GrupoItemPesquisaReferenciaPeriodo {
  periodo: number;
  label: string;
}

export const grupoItemPesquisaReferenciaPeriodos: ReadonlyArray<GrupoItemPesquisaReferenciaPeriodo> = [
  { periodo: 1, label: '3 meses' },
  { periodo: 2, label: '6 meses' },
  { periodo: 3, label: '9 meses' },
  { periodo: 4, label: '1 ano' },
  { periodo: 5, label: '2 anos' },
  { periodo: 6, label: '3 anos' },
  { periodo: 7, label: '4 anos' },
  { periodo: 8, label: '5 anos' },
  { periodo: 9, label: '6 anos' },
  { periodo: 10, label: '7 anos' },
  { periodo: 11, label: '8 anos' },
  { periodo: 12, label: '9 anos' },
  { periodo: 13, label: '10 anos' },
];

export function getAtributos(grupoItem: GrupoItemDE, atributoAtivo: Entity<boolean>): Entity<string> {
  return Object.entries(atributoAtivo).reduce((acc, [atributo, ativo]) => {
    const attr = `atributo${atributo}`;
    if (ativo && grupoItem[attr]) {
      acc[attr] = grupoItem[attr];
    }
    return acc;
  }, {});
}

export const defaultAtributoAtivo: Readonly<Entity<boolean>> = {
  1: true,
  2: true,
  3: true,
  4: true,
};
