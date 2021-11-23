import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { compareValues, orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { GrupaoGerenciar, GrupoGerenciarViewModel, mapGrupoGerenciar } from '../../models/gerenciar';
import { groupBy, maxBy, minBy, uniqBy } from 'lodash-es';

export interface OrderByGerenciadorGruposType {
  idGrupo: number;
  codigoGrupo: string;
  idOrcamentoGrupo?: number;
}

export function phMapGerenciadorGrupos(gruposGerenciar: GrupoGerenciarViewModel[]): GrupaoGerenciar[] {
  const grupoes = uniqBy(gruposGerenciar, 'idGrupao')
    .map(({ idGrupao, nomeGrupao, numeroGrupao }) => ({ grupos: [], idGrupao, nomeGrupao, numeroGrupao }))
    .map(grupao => ({
      ...grupao,
      grupos: gruposGerenciar
        .filter(grupoGerenciar => grupoGerenciar.idGrupao === grupao.idGrupao)
        .map(mapGrupoGerenciar),
    }))
    .map(grupao => {
      const gruposGroupedList = groupBy(grupao.grupos, 'idGrupo');
      const gruposGrouped = Object.entries(gruposGroupedList).reduce((mapped, [idGrupo, grupos]) => {
        return mapped.set(+idGrupo, [
          minBy(grupos, 'idOrcamentoGrupo')?.idOrcamentoGrupo ?? 0,
          maxBy(grupos, 'idOrcamentoGrupo')?.idOrcamentoGrupo ?? 0,
        ]);
      }, new Map<number, [number, number]>());
      return {
        ...grupao,
        grupos: grupao.grupos.map(grupo => {
          const [idOrcamentoGrupoOrigin, lastIdOrcamentoGrupo] = gruposGrouped.get(grupo.idGrupo);
          return {
            ...grupo,
            principal: idOrcamentoGrupoOrigin === grupo.idOrcamentoGrupo,
            idOrcamentoGrupoOrigin,
            isLast: lastIdOrcamentoGrupo === grupo.idOrcamentoGrupo,
            enabled: !!gruposGroupedList[grupo.idGrupo]?.some(g => g.ativo),
          };
        }),
      };
    });
  return orderBy(grupoes, ['numeroGrupao', 'idGrupao']).map(grupao => ({
    ...grupao,
    grupos: phOrderByGerenciadorGrupos(grupao.grupos),
  }));
}

export function phOrderByGerenciadorGrupos<T extends OrderByGerenciadorGruposType>(grupos: T[]): T[] {
  return [...grupos].sort((grupoA, grupoB) => {
    const idGrupoA = grupoA.idGrupo;
    const codigoGrupoA = grupoA.codigoGrupo;
    const idOrcamentoGrupoA = grupoA.idOrcamentoGrupo;
    const idGrupoB = grupoB.idGrupo;
    const codigoGrupoB = grupoB.codigoGrupo;
    const idOrcamentoGrupoB = grupoB.idOrcamentoGrupo;
    if (codigoGrupoA !== codigoGrupoB) {
      return orderByCodigo<T>('codigoGrupo')(grupoA, grupoB);
    } else if (idGrupoA !== idGrupoB) {
      return compareValues(idGrupoA, idGrupoB);
    } else {
      return compareValues(idOrcamentoGrupoA, idOrcamentoGrupoB);
    }
  });
}
