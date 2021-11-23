import { CurvaAbcGrupo, Familia } from '../../models';
import { search } from '@aw-components/aw-utils/aw-search/aw-search.pipe';

export function getEstimatedValue(element: CurvaAbcGrupo): number {
  if (element.multiplos) {
    return element.multiplos
      .filter(grupo => grupo.ativoPlanilha)
      .reduce((accum, grupo) => accum + grupo.valorSelecionado || grupo.valorMetaGrupo || 0, 0);
  }
  if (!element.ativoPlanilha) {
    return 0;
  }
  return element.valorSelecionado || element.valorMetaGrupo;
}

export function getTotalGoalValue(element: CurvaAbcGrupo): number {
  if (element.multiplos) {
    return element.multiplos
      .filter(grupo => grupo.ativoPlanilha)
      .reduce((accum, grupo) => accum + grupo.valorMetaGrupo, 0);
  }
  if (!element.ativoPlanilha) {
    return 0;
  }
  return element.valorMetaGrupo;
}

export interface FilterCurvaAbc {
  familias: Familia[];
  grupo: string | null;
}

export function filterCurvaAbc(grupos: CurvaAbcGrupo[], { familias, grupo }: FilterCurvaAbc): CurvaAbcGrupo[] {
  if (familias?.length) {
    grupos = grupos
      .filter(curvaAbcGrupo =>
        familias.some(
          familia =>
            curvaAbcGrupo.idOrcamentoFamilia === familia.idOrcamentoFamilia ||
            curvaAbcGrupo.multiplos?.some(curvaInner => curvaInner.idOrcamentoFamilia === familia.idOrcamentoFamilia)
        )
      )
      .map(curvaAbcGrupo => {
        if (curvaAbcGrupo.multiplos) {
          curvaAbcGrupo = {
            ...curvaAbcGrupo,
            multiplos: curvaAbcGrupo.multiplos.filter(inner =>
              familias.some(familia => familia.idOrcamentoFamilia === inner.idOrcamentoFamilia)
            ),
          };
        }
        return curvaAbcGrupo;
      });
  }
  if (grupo) {
    grupos = search(grupos, ['nomeGrupo', 'codigoGrupo'], grupo);
  }
  return grupos;
}
