import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { GaAtividadeState, GaAtividadeStore } from './ga-atividade.store';
import { combineLatest, Observable } from 'rxjs';
import { GaAndar, GaEdificio, GaSite, PavimentoTupple } from '../../model/pavimento';
import { filter, map, switchMap } from 'rxjs/operators';
import { GaEtapaQuery } from '../etapa/ga-etapa.query';
import { GaPavimentoQuery } from '../pavimento/ga-pavimento.query';
import { GaAtividade } from '../../model/atividade';
import { GaEtapa } from '../../model/etapa';

export function comparatorAtividade(
  etapa: GaEtapa,
  site: GaSite,
  edificio: GaEdificio,
  andar: GaAndar
): (atividade: GaAtividade) => boolean {
  return ({ idCondominio, idEdificio, idPavimento, idEtapa }) =>
    idEtapa === etapa.id && idCondominio === site?.id && idEdificio === edificio?.id && idPavimento === andar?.id;
}

export function createIdAtividade(etapa: GaEtapa, site?: GaSite, edificio?: GaEdificio, andar?: GaAndar): string {
  return `${etapa.id}-${site?.id ?? ''}-${edificio?.id ?? ''}-${andar?.id ?? ''}`;
}

@Injectable({ providedIn: 'root' })
export class GaAtividadeQuery extends QueryEntity<GaAtividadeState> {
  constructor(
    protected store: GaAtividadeStore,
    private gaEtapaQuery: GaEtapaQuery,
    private gaPavimentoQuery: GaPavimentoQuery
  ) {
    super(store);
  }

  all$ = this.selectAll();

  etapaPavimentoSelected$: Observable<[GaEtapa, ...PavimentoTupple]> = combineLatest([
    this.gaEtapaQuery.selected$,
    this.gaPavimentoQuery.selectedTupple$,
  ]).pipe(
    filter(([etapaSelected, [projeto, site]]) => !!etapaSelected && (!!site || !!projeto)),
    map(([etapa, pavimentoTupple]) => [etapa, ...pavimentoTupple])
  );

  isLoading$ = combineLatest([this.etapaPavimentoSelected$, this.select('loadingAtividades')]).pipe(
    map(
      ([[etapa, _, site, edificio, andar], loadingMap]) => loadingMap[createIdAtividade(etapa, site, edificio, andar)]
    )
  );

  onlySelected$ = this.select('onlySelected');

  atividades$ = this.etapaPavimentoSelected$.pipe(
    switchMap(([etapa, _, site, edificio, andar]) => this.selectFrom(etapa, site, edificio, andar))
  );

  superadosCount$ = this.all$.pipe(
    map(
      atividades =>
        atividades.reduce((acc, atividade) => {
          const arquivos = (atividade.arquivos ?? []).filter(arquivo => arquivo.superar);
          return acc + arquivos.length;
        }, 0) ?? 0
    )
  );

  selectFrom(etapa: GaEtapa, site: GaSite, edificio: GaEdificio, andar: GaAndar): Observable<GaAtividade[]> {
    return this.all$.pipe(map(atividades => atividades.filter(comparatorAtividade(etapa, site, edificio, andar))));
  }

  hasAny(etapa: GaEtapa, site: GaSite, edificio: GaEdificio, andar: GaAndar): boolean {
    return this.getAll().some(comparatorAtividade(etapa, site, edificio, andar));
  }
}
