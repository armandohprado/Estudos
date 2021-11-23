import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, finalize, map, Observable, pairwise, Subject, switchMap, tap } from 'rxjs';
import { isFunction, sumBy } from 'lodash-es';
import { FamiliaAlt, GrupoAlt, OrcamentoCenarioSimples, PropostaAlt } from '../../models';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CotacaoService } from '@aw-services/cotacao/cotacao.service';
import { CotacaoCollapseEnum } from '@aw-models/cotacao';
import { trackByFactory } from '@aw-utils/track-by';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { AwRouterService } from '@aw-services/core/aw-router.service';
import { PlanilhaClienteService } from '@aw-services/planilha-cliente/planilha-cliente.service';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import {
  getTotalPorPaginaOptions,
  mapFamiliasCotacao,
  validateTotalPorPaginaQueryParam,
} from '@aw-services/orcamento-alt/orcamento-alt-utils';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';
import { FamiliaAltTotal } from '@aw-models/familia-alt';
import { AwSelectFooterOptions } from '@aw-components/aw-select/aw-select.type';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { PaginacaoComRange, PaginacaoRange } from '@aw-models/paginacao';
import { GrupoAltSimples } from '@aw-models/grupo-alt-simples';
import { mapParamId } from '@aw-utils/map-param-id';
import { auditTime, takeUntil } from 'rxjs/operators';
import { Destroyable } from '@aw-shared/components/common/destroyable-component';

interface GrupoCombo extends GrupoAltSimples {
  label: string;
}

@Component({
  selector: 'app-cotacao',
  templateUrl: './cotacao.component.html',
  styleUrls: ['./cotacao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotacaoComponent extends Destroyable implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private cotacaoService: CotacaoService,
    private cenariosService: CenariosService,
    private awRouterService: AwRouterService,
    private planilhaClienteService: PlanilhaClienteService,
    private orcamentoAltService: OrcamentoAltService,
    private projetoService: ProjetoService,
    private orcamentoService: OrcamentoService
  ) {
    super();
  }

  private readonly _familiasTotais$ = new BehaviorSubject<FamiliaAltTotal[]>([]);
  private readonly _familias$ = new BehaviorSubject<FamiliaAlt[]>([]);
  private readonly _refreshFamiliasTotais$ = new Subject<void>();

  readonly idOrcamentoCenario$ = this.activatedRoute.paramMap.pipe(mapParamId(RouteParamEnum.idOrcamentoCenario));
  readonly familias$ = combineLatest([
    this.orcamentoService.visualizarGruposEmLista$,
    this._familias$,
    this._familiasTotais$,
  ]).pipe(
    map(([visualizarGruposEmLista, familias, familiasTotais]) =>
      mapFamiliasCotacao(familias, visualizarGruposEmLista, familiasTotais)
    )
  );
  readonly totalSelecionado$ = this._familiasTotais$.pipe(
    map(familias => sumBy(familias, familia => (familia.opcional ? 0 : familia.total)) ?? 0)
  );
  readonly projeto$ = this.projetoService.projeto$;
  readonly cenarioPadrao$ = this.cenariosService.cenarioPadrao$;
  readonly idOrcamento$ = this.activatedRoute.paramMap.pipe(mapParamId(RouteParamEnum.idOrcamento));
  readonly urlPlanilhaCliente$ = this.idOrcamento$.pipe(
    map(idOrcamento => this.planilhaClienteService.getUrlPlanilhaClienteLegado(idOrcamento))
  );

  readonly gruposComboFooterOptions: AwSelectFooterOptions = {
    secondaryBtn: { title: 'Limpar' },
    primaryBtn: { title: 'Aplicar' },
  };
  readonly cotacaoCollapseEnum = CotacaoCollapseEnum;
  readonly totalPorPaginaOptions = getTotalPorPaginaOptions();

  readonly trackByFamilia = trackByFactory<FamiliaAlt>('idOrcamentoFamilia');
  readonly trackByGrupo = trackByFactory<GrupoAlt>('idOrcamentoGrupo');

  paginacaoMetadataRange: PaginacaoRange[] = [];
  cenariosRelacionados: OrcamentoCenarioSimples[] = [];
  gruposCombo: GrupoCombo[] = [];
  idOrcamentoGruposFiltro: number[] = (
    this.activatedRoute.snapshot.queryParamMap.getAll(RouteParamEnum.idOrcamentoGrupos) ?? []
  ).map(Number);
  idOrcamentoGruposFiltroAplicado: number[] = this.idOrcamentoGruposFiltro;
  totalPorPagina = validateTotalPorPaginaQueryParam(
    this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.totalPorPagina)
  );
  paginaAtual = +(this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.paginaAtual) ?? 1);
  loading = false;
  collapses = this.cotacaoService.getCotacaoCollapse(this.getIdOrcamentoCenario());

  private _updateGrupo(
    idOrcamentoFamilia: number,
    idOrcamentoGrupo: number,
    partial: Partial<GrupoAlt> | ((grupo: GrupoAlt) => GrupoAlt)
  ): void {
    const update = isFunction(partial) ? partial : (grupo: GrupoAlt) => ({ ...grupo, ...partial });
    this._familias$.next(
      this._familias$.value.map(familia => {
        if (idOrcamentoFamilia === familia.idOrcamentoFamilia) {
          familia = {
            ...familia,
            grupos: familia.grupos.map(grupo => {
              if (grupo.idOrcamentoGrupo === idOrcamentoGrupo) {
                grupo = update(grupo);
              }
              return grupo;
            }),
          };
        }
        return familia;
      })
    );
  }

  totalPorPaginaChange(totalPorPagina: number): void {
    this.paginaAtual = 1;
    this.getFamiliasPaginacao(this.paginaAtual, totalPorPagina);
  }

  getFamiliasPaginacao(paginaAtual: number, totalPorPagina: number): void {
    this.loading = true;
    const idOrcamento = this.getIdOrcamento();
    const idOrcamentoCenario = this.getIdOrcamentoCenario();
    this.idOrcamentoGruposFiltro = [];
    this.orcamentoAltService
      .getFamiliasPaginacao(idOrcamento, idOrcamentoCenario, paginaAtual, totalPorPagina)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.router
            .navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: {
                [RouteParamEnum.paginaAtual]: paginaAtual,
                [RouteParamEnum.totalPorPagina]: totalPorPagina,
                [RouteParamEnum.idOrcamentoGrupos]: null,
              },
              queryParamsHandling: 'merge',
            })
            .then();
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(({ retorno, range }) => {
        this._familias$.next(retorno);
        this.paginacaoMetadataRange = range;
      });
  }

  getIdOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }

  getIdOrcamento(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  }

  toggleCollapse(type: CotacaoCollapseEnum, id: string | number): void {
    this.collapses[type + id] = !this.collapses[type + id];
  }

  selectCenario(idOrcamentoCenario: number): void {
    this.paginaAtual = 1;
    this.idOrcamentoGruposFiltro = this.idOrcamentoGruposFiltroAplicado = [];
    this.router
      .navigate(['../../', idOrcamentoCenario, 'cotacao'], {
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
        queryParams: {
          [RouteParamEnum.paginaAtual]: this.paginaAtual,
          [RouteParamEnum.idOrcamentoGrupos]: [],
        },
      })
      .then();
    this.changeDetectorRef.markForCheck();
  }

  navigateToCenarios($event: MouseEvent): boolean {
    let commands = ['lista-cenarios'];
    if (this.cenariosService.getCenarioPadraoSnapshot()?.idOrcamentoChangeOrder) {
      commands = ['../', 'compras', 'controle-compra', 'change-order'];
    }
    return this.awRouterService.handleNavigate($event, commands, {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'preserve',
    });
  }

  onFiltroGrupos(): void {
    if (!this.idOrcamentoGruposFiltro.length) {
      this.onFiltroGrupoClear();
    } else {
      this.idOrcamentoGruposFiltroAplicado = this.idOrcamentoGruposFiltro;
      this.loading = true;
      this.orcamentoAltService
        .getGruposFiltro(this.getIdOrcamento(), this.getIdOrcamentoCenario(), this.idOrcamentoGruposFiltro)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.changeDetectorRef.markForCheck();
          })
        )
        .subscribe(familias => {
          this._familias$.next(familias);
          this.router
            .navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: { [RouteParamEnum.idOrcamentoGrupos]: this.idOrcamentoGruposFiltro },
              queryParamsHandling: 'merge',
            })
            .then();
        });
    }
  }

  onFiltroGrupoClear(): void {
    this.idOrcamentoGruposFiltro = this.idOrcamentoGruposFiltroAplicado = [];
    this.getFamiliasPaginacao(this.paginaAtual, this.totalPorPagina);
  }

  onPropostaChange($event: PropostaAlt): void {
    this._updateGrupo($event.idOrcamentoFamilia, $event.idOrcamentoGrupo, grupo => ({
      ...grupo,
      propostas: grupo.propostas.map(proposta => {
        if (proposta.idProposta === $event.idProposta) {
          proposta = { ...proposta, ...$event };
        }
        return proposta;
      }),
    }));
  }

  onGrupoChange($event: GrupoAlt): void {
    this._updateGrupo($event.idOrcamentoFamilia, $event.idOrcamentoGrupo, $event);
    this._refreshFamiliasTotais$.next();
  }

  onGrupoExcluir($event: GrupoAlt): void {
    if (this.idOrcamentoGruposFiltroAplicado.length) {
      this.idOrcamentoGruposFiltro = this.idOrcamentoGruposFiltro.filter(
        idOrcamentoGrupo => idOrcamentoGrupo !== $event.idOrcamentoGrupo
      );
      this.gruposCombo = this.gruposCombo.filter(grupo => grupo.idOrcamentoGrupo !== $event.idOrcamentoGrupo);
      this.onFiltroGrupos();
    } else {
      this.getFamiliasPaginacao(this.paginaAtual, this.totalPorPagina);
    }
    this._refreshFamiliasTotais$.next();
  }

  getFamiliasTotais(): Observable<FamiliaAltTotal[]> {
    return this.orcamentoAltService.getFamiliasTotais(this.getIdOrcamento(), this.getIdOrcamentoCenario()).pipe(
      tap(familiasTotais => {
        this._familiasTotais$.next(familiasTotais);
      })
    );
  }

  onCollapseAll(grupos: GrupoAlt[]): void {
    for (const grupo of grupos) {
      this.collapses[CotacaoCollapseEnum.grupo + grupo.idOrcamentoGrupo] = true;
    }
    this.changeDetectorRef.markForCheck();
  }

  onExpandAll(grupos: GrupoAlt[]): void {
    for (const grupo of grupos) {
      this.collapses[CotacaoCollapseEnum.grupo + grupo.idOrcamentoGrupo] = false;
    }
    this.changeDetectorRef.markForCheck();
  }

  ngOnInit(): void {
    // Primeira navegação para colocar os parametros de paginacao na url
    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          [RouteParamEnum.paginaAtual]: this.paginaAtual,
          [RouteParamEnum.totalPorPagina]: this.totalPorPagina,
        },
        queryParamsHandling: 'merge',
      })
      .then();

    // Subscribe para receber todas as atualizações quando a pagina mudar de cenário
    this.activatedRoute.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      const familiasPaginacao: PaginacaoComRange<FamiliaAlt> | undefined = data[RouteDataEnum.familiasPaginacao];
      if (familiasPaginacao) {
        const { retorno, range } = familiasPaginacao;
        this._familias$.next(retorno);
        this.paginacaoMetadataRange = range;
      }
      const familiasTotais: FamiliaAltTotal[] | undefined = data[RouteDataEnum.familiasTotais];
      if (familiasTotais?.length) {
        this._familiasTotais$.next(familiasTotais);
      }
      const gruposCombo: GrupoAltSimples[] | undefined = data[RouteDataEnum.gruposCombo];
      if (gruposCombo?.length) {
        this.gruposCombo = gruposCombo.map(grupo => ({
          ...grupo,
          label: `${grupo.numeracao ?? grupo.codigo} - ${grupo.nome}`,
        }));
      }
      const cenariosRelacionados: OrcamentoCenarioSimples[] | undefined = data[RouteDataEnum.cenariosRelacionados];
      if (cenariosRelacionados?.length) {
        this.cenariosRelacionados = cenariosRelacionados;
      }
      this.changeDetectorRef.markForCheck();
    });
    this.idOrcamentoCenario$
      .pipe(takeUntil(this.destroy$), pairwise())
      .subscribe(([idOrcamentoCenarioOld, idOrcamentoCenario]) => {
        if (idOrcamentoCenarioOld) {
          this.cotacaoService.updateStateCollapses(idOrcamentoCenarioOld, this.collapses);
        }
        this.collapses = this.cotacaoService.getCotacaoCollapse(idOrcamentoCenario);
      });
    this._refreshFamiliasTotais$
      .pipe(
        takeUntil(this.destroy$),
        auditTime(300),
        switchMap(() => this.getFamiliasTotais())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.cotacaoService.updateStateCollapses(this.getIdOrcamentoCenario(), this.collapses);
  }
}
