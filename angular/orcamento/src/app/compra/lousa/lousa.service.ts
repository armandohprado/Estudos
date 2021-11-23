import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LousaCabecalho } from '../models/lousa-cabecalho';
import { AwFilterPipeProperties, AwFilterPipeType } from '@aw-components/aw-filter/aw-filter.pipe';
import { AwFilterConditional, AwFilterType } from '@aw-components/aw-filter/aw-filter.type';
import { Order, orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { isFunction } from 'lodash-es';
import { awFilter } from '@aw-components/aw-filter/aw-filter.util';
import { LousaGrupo, LousaSort } from '../models/lousa-grupo';
import { lousaMapGrupos } from './utils';
import { ControleComprasService } from '../controle-compras/state/controle-compras/controle-compras.service';

@Injectable({ providedIn: 'root' })
export class LousaService {
  constructor(private controleComprasService: ControleComprasService) {}

  private readonly _grupos$ = new BehaviorSubject<LousaGrupo[]>([]);
  private readonly _cabecalhos$ = new BehaviorSubject<LousaCabecalho[]>([]);
  private readonly _filtros$ = new BehaviorSubject<AwFilterPipeProperties<LousaGrupo>>({});
  private readonly _sort$ = new BehaviorSubject<LousaSort | null>(null);
  private readonly _hiddenColumns$ = new BehaviorSubject(true);

  readonly cabecalhos$ = this._cabecalhos$.asObservable();
  readonly grupos$ = this._grupos$.asObservable();
  readonly filtros$ = this._filtros$.asObservable();
  readonly sort$ = this._sort$.asObservable();
  readonly gruposFilteredAndOrdered$: Observable<LousaGrupo[]> = combineLatest([
    this.grupos$,
    this.filtros$,
    this.sort$,
  ]).pipe(
    map(([grupos, filter, sort]) => {
      grupos = awFilter(grupos, filter);
      if (sort) {
        grupos = orderBy(grupos, sort.property, sort.ordem);
      }
      return grupos;
    })
  );
  readonly hiddenColumns$ = this._hiddenColumns$.asObservable();
  readonly columns = 14;

  private _updateFilter(
    partial:
      | AwFilterPipeProperties<LousaGrupo>
      | ((filter: AwFilterPipeProperties<LousaGrupo>) => AwFilterPipeProperties<LousaGrupo>)
  ): void {
    const update = isFunction(partial)
      ? partial
      : (filter: AwFilterPipeProperties<LousaGrupo>) => ({ ...filter, ...partial });
    this._filtros$.next(update(this._filtros$.value));
  }

  toggleHiddenColumns(): void {
    this._hiddenColumns$.next(!this._hiddenColumns$.value);
  }

  updateFilter(prop: keyof LousaGrupo, term: any, type: AwFilterType): void {
    let filter: AwFilterPipeType = { term, type, filterType: 'filter' };
    if (!term) {
      filter = null;
    }
    this._updateFilter({ [prop]: filter });
  }

  updateSort(property: keyof LousaGrupo, ordem: Order): void {
    const sortSnapshot = this._sort$.value;
    if (!property || (sortSnapshot?.property === property && sortSnapshot?.ordem === ordem)) {
      this._sort$.next(null);
    } else {
      this._sort$.next({ property, ordem });
    }
  }

  updateFilterConditional(prop: keyof LousaGrupo, $event: AwFilterConditional<any>, type: AwFilterType): void {
    let filter: AwFilterPipeType = { conditional: $event, type, filterType: 'conditional' };
    if (!$event?.term) {
      filter = null;
    }
    this._updateFilter({ [prop]: filter });
  }

  getCabecalhos(idOrcamentoCenario: number): Observable<LousaCabecalho[]> {
    return this.controleComprasService.getLousaCabecalho(idOrcamentoCenario).pipe(
      tap(cabecalhos => {
        this._cabecalhos$.next(cabecalhos);
      })
    );
  }

  getGrupos(idOrcamentoCenario: number): Observable<LousaGrupo[]> {
    return this.controleComprasService.getLousaGrupos(idOrcamentoCenario).pipe(
      map(lousaMapGrupos),
      tap(grupos => {
        this._grupos$.next(grupos);
      })
    );
  }

  destroy(): void {
    this._filtros$.next({});
    this._sort$.next(null);
  }
}
