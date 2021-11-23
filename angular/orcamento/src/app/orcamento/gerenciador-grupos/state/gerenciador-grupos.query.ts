import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { GerenciadorGruposState, GerenciadorGruposStore } from './gerenciador-grupos.store';
import { map } from 'rxjs/operators';
import { reduceTo } from '@aw-utils/rxjs/operators';
import { CenarioGG } from './gerenciador-grupo.model';
import { combineLatest, Observable } from 'rxjs';
import { sumBy } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class GerenciadorGruposQuery extends QueryEntity<GerenciadorGruposState> {
  constructor(protected store: GerenciadorGruposStore) {
    super(store);
  }

  selectLoading$ = this.selectLoading();

  cenarios$ = this.select('cenarios');
  gruposCenarios$: Observable<CenarioGG[]> = this.selectAll().pipe(
    reduceTo('grupos'),
    reduceTo('cenarios'),
    map(cenarios => cenarios.filter(cenario => cenario?.ativo))
  );
  cenariosWithTotal$: Observable<(CenarioGG & { valorTotalOrcado: number })[]> = combineLatest([
    this.cenarios$,
    this.gruposCenarios$,
  ]).pipe(
    map(([cenarios, cenariosGrupos]) =>
      cenarios.map(cenario => ({
        ...cenario,
        valorTotalOrcado: sumBy(
          cenariosGrupos.filter(
            cenarioGrupo => cenarioGrupo?.idOrcamentoCenario === cenario?.idOrcamentoCenario && !cenarioGrupo?.opcional
          ),
          'valorOrcado'
        ),
      }))
    )
  );

  all$ = this.selectAll();
}
