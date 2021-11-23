import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';

export enum GrupoItemFiltroEnum {
  todos,
  selecionados,
  naoSelecionados,
}

export type GrupoItemFiltro = KeyValue<GrupoItemFiltroEnum, string>;

export function getGrupoItemFiltrosComboBoxArray(): GrupoItemFiltro[] {
  return [
    { key: GrupoItemFiltroEnum.todos, value: 'Todos' },
    { key: GrupoItemFiltroEnum.selecionados, value: 'Selecionados' },
    { key: GrupoItemFiltroEnum.naoSelecionados, value: 'Não selecionados' },
  ];
}

export function deGrupoItemFiltro<T extends { ativo: boolean }>(value: T[], filtro: GrupoItemFiltroEnum): T[] {
  switch (filtro) {
    case GrupoItemFiltroEnum.selecionados:
      return value.filter(item => item.ativo);
    case GrupoItemFiltroEnum.naoSelecionados:
      return value.filter(item => !item.ativo);
    default:
      return value;
  }
}

@Pipe({ name: 'deGrupoItemFiltro' })
export class DeGrupoItemFiltroPipe implements PipeTransform {
  transform<T extends { ativo: boolean }>(value: T[], filtro: GrupoItemFiltroEnum): T[] {
    if (!value){
      return null
    }
    return deGrupoItemFiltro<T>(value, filtro);
  }
}
