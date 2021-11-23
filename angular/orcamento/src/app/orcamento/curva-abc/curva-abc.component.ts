import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { OperatorFunction, Subject, switchMap } from 'rxjs';
import { CurvaAbcGrupo, Familia, Grupo } from '../../models';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { sumBy } from 'lodash-es';
import { SupplierRulePipe } from '@aw-shared/pipes/supplier-rule.pipe';
import { getEstimatedValue } from './helper';
import { inOutAnimation } from '@aw-shared/animations/inOut';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { sumCurvaABCGroupGoal } from './sum-curva-abcgroup-goal.pipe';
import { CurvaAbcFiltroEvent } from './curva-abc-table/curva-abc-table.component';
import { StateComponent } from '@aw-shared/components/common/state-component';
import { reduceToFunc } from '@aw-utils/rxjs/operators';
import { groupBy } from '@aw-utils/group-by';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';
import { ActivatedRoute } from '@angular/router';

export interface CurvaABCState {
  filtroGrupos: Omit<CurvaAbcFiltroEvent, 'firstChange'>;
  filtroGruposOpcionais: Omit<CurvaAbcFiltroEvent, 'firstChange'>;
}

@Component({
  selector: 'app-curva-abc',
  templateUrl: './curva-abc.component.html',
  styleUrls: ['./curva-abc.component.scss'],
  animations: [inOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurvaABCComponent extends StateComponent<CurvaABCState> implements OnInit {
  constructor(
    private orcamentoService: OrcamentoService,
    private routerQuery: RouterQuery,
    public changeDetectorRef: ChangeDetectorRef,
    private projetoService: ProjetoService,
    private activatedRoute: ActivatedRoute
  ) {
    super({ filtroGrupos: { grupos: [], totalFiltrado: 0 }, filtroGruposOpcionais: { grupos: [], totalFiltrado: 0 } });
  }

  private readonly _refreshOrcamento$ = new Subject<void>();

  get idOrcamento(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  }

  get idOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }

  idOrcamentoCenario$ = this.routerQuery.selectParams(RouteParamEnum.idOrcamentoCenario).pipe(
    distinctUntilChanged(),
    filter(id => !!id),
    map(Number),
    shareReplay()
  );

  supplierRulePipe = new SupplierRulePipe();
  projeto$ = this.projetoService.projeto$;

  orcamento$ = this.orcamentoService.orcamento$.asObservable();
  private _familias$ = this.orcamentoService.familias$.pipe(
    this.orcamentoService.mapFamiliasOpcionais(),
    map(familias =>
      familias.map(familia => ({
        ...familia,
        grupoes: familia.grupoes.map(grupao => ({
          ...grupao,
          grupos: grupao.grupos.map(grupo => ({ ...grupo, descricaoFamilia: familia.descricaoFamilia })),
        })),
      }))
    )
  );
  familias$ = this._familias$.pipe(map(familias => familias.filter(familia => !familia.opcional)));
  familiasOpcionais$ = this._familias$.pipe(map(familias => familias.filter(familia => familia.opcional)));

  grupos$ = this.familias$.pipe(this.selectGrupos());
  gruposOpcionais$ = this.familiasOpcionais$.pipe(this.selectGrupos());

  sumGrupos$ = this.grupos$.pipe(map(sumCurvaABCGroupGoal));
  sumGruposOpcionais$ = this.gruposOpcionais$.pipe(map(sumCurvaABCGroupGoal));
  filtroState$ = this.selectState();

  selectGrupos(): OperatorFunction<Familia[], CurvaAbcGrupo[]> {
    return map(familias =>
      this.transformToMultiplosAndCalculateConsistency(reduceToFunc(reduceToFunc(familias, 'grupoes'), 'grupos'))
    );
  }

  diffValueFn(goalValue: number, selectedValue: number): number {
    if (selectedValue) {
      const diffValue = (goalValue - selectedValue) / goalValue;
      return !isNaN(diffValue) ? diffValue : 0;
    }
    return 0;
  }

  diffMultiplosValueFn(multiplos: CurvaAbcGrupo[]): number {
    const totalGoal = sumBy(multiplos, 'valorMetaGrupo');
    const totalEstimated = sumBy(multiplos, 'valorSelecionado');
    return this.diffValueFn(totalGoal, totalEstimated);
  }

  private transformToMultiplosAndCalculateConsistency(grupos: Grupo[]): CurvaAbcGrupo[] {
    const totalEstimatedValue = sumBy(grupos, grupo => grupo.valorSelecionado || grupo.valorMetaGrupo);
    const gruposCurvaAbcMapped: CurvaAbcGrupo[] = grupos.map(grupo => ({
      ...grupo,
      valorConsiderado: 0,
      codigoGrupoInt: parseFloat(grupo.codigoGrupo),
      total: 0,
      diff: 0,
      regraFornecedor: this.supplierRulePipe.transform(grupo),
    }));
    const gruposGrouped = groupBy(gruposCurvaAbcMapped, 'idGrupo');
    const gruposCurvaAbc: CurvaAbcGrupo[] = [];
    for (const [, gruposgroup] of gruposGrouped) {
      const grupo = gruposgroup[0];
      gruposCurvaAbc.push({ ...grupo, multiplos: gruposgroup.length > 1 ? gruposgroup : null });
    }
    return gruposCurvaAbc.map(grupo => this.mapGrupo(grupo, totalEstimatedValue));
  }

  private mapGrupo(grupo: CurvaAbcGrupo, totalEstimatedValue: number): CurvaAbcGrupo {
    if (grupo.multiplos?.length) {
      const multiplos = grupo.multiplos.map(grupoMultiplo => this.mapGrupo(grupoMultiplo, totalEstimatedValue));
      grupo = {
        ...grupo,
        multiplos,
        valorSelecionado: sumBy(
          multiplos.filter(multiplo => multiplo.ativoPlanilha),
          'valorSelecionado'
        ),
      };
    }
    const valorConsiderado = getEstimatedValue(grupo);
    return {
      ...grupo,
      valorConsiderado,
      codigoGrupoInt: parseFloat(grupo.codigoGrupo),
      diff: grupo.multiplos?.length
        ? this.diffMultiplosValueFn(grupo.multiplos)
        : this.diffValueFn(grupo.valorMetaGrupo, grupo.valorSelecionado),
    };
  }

  refreshOrcamento(): void {
    this._refreshOrcamento$.next();
  }

  onFiltroEvent({ firstChange, ...$event }: CurvaAbcFiltroEvent, key: keyof CurvaABCState): void {
    this.updateState({ [key]: $event });
    if (firstChange) {
      // Foi preciso fazer isso porque o primeiro evento é disparado antes mesmo do componente ser renderizado
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnInit(): void {
    this._refreshOrcamento$
      .pipe(
        debounceTime(10),
        switchMap(() => this.orcamentoService.buscarOrcamento(this.idOrcamento, this.idOrcamentoCenario)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
