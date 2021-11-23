import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { GaPavimentoState, GaPavimentoStore } from './ga-pavimento.store';
import { Observable } from 'rxjs';
import { GaAndar, GaEdificio, GaSite, Pavimento, PavimentoTupple } from '../../model/pavimento';
import { map } from 'rxjs/operators';
import { ProjetoAlt } from '../../../../models';

export function comparePavimentos(
  [projetoA, siteA, edificioA, andarA]: PavimentoTupple,
  [projetoB, siteB, edificioB, andarB]: PavimentoTupple
): boolean {
  return (
    projetoA?.idProjeto === projetoB?.idProjeto &&
    siteA?.id === siteB?.id &&
    edificioA?.id === edificioB?.id &&
    andarA?.id === andarB?.id
  );
}

@Injectable({ providedIn: 'root' })
export class GaPavimentoQuery extends QueryEntity<GaPavimentoState> {
  constructor(protected store: GaPavimentoStore) {
    super(store);
  }

  all$ = this.selectAll();

  selected$ = this.select(['projetoSelected', 'siteSelected', 'edificioSelected', 'andarSelected']);

  selectedTupple$: Observable<PavimentoTupple> = this.selected$.pipe(
    map(({ projetoSelected, siteSelected, edificioSelected, andarSelected }) => {
      return [projetoSelected, siteSelected, edificioSelected, andarSelected];
    })
  );

  hasAnySelected$ = this.selectedTupple$.pipe(map(tupple => tupple.some(Boolean)));

  pavimentoSelected$ = this.selectedTupple$.pipe(
    map(([projeto, site, edificio, andar]) => andar ?? edificio ?? site ?? projeto)
  );

  nomePavimentoSelected$ = this.selectedTupple$.pipe(
    map(tupple =>
      tupple
        .filter(Boolean)
        .map(pavimento => (pavimento as Pavimento).nome ?? (pavimento as ProjetoAlt).nomeProjeto)
        .join(' - ')
    )
  );

  isProjetoSelected$ = this.pavimentoSelected$.pipe(map(value => !!(value as ProjetoAlt)?.idProjeto));

  isActive(site: GaSite, edificio: GaEdificio, andar: GaAndar, projeto: ProjetoAlt): Observable<boolean> {
    return this.selectedTupple$.pipe(
      map(selectedTupple => {
        return (
          (selectedTupple[0] || selectedTupple[1]) &&
          comparePavimentos([projeto, site, edificio, andar], selectedTupple)
        );
      })
    );
  }

  hasLoaded(): boolean {
    return this.getValue().hasLoaded;
  }
}
