import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { GrupaoGerenciar, GrupoGerenciar } from '../../models/gerenciar';
import { CenarioSimples, OrcamentoCenarioFamilia } from '../../models/cenario';
import { PlanilhaVendasHibridaService } from '../../planilha-vendas-hibrida.service';
import { debounceTime, filter, finalize, map, take, takeUntil, tap } from 'rxjs/operators';
import { findRight, upsert } from '@aw-utils/util';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { isFunction } from 'lodash-es';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { getPositions } from '@aw-components/aw-filter/aw-filter.util';
import { TemplatePortal } from '@angular/cdk/portal';
import { refresh } from '@aw-utils/rxjs/operators';
import { FormControl } from '@angular/forms';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { trackByFactory } from '@aw-utils/track-by';
import { OrcamentoGrupo } from '../../models/grupo';
import { DataGerenciadorGruposService } from '../../../gerenciador-grupos/services/data-gerenciador-grupos.service';
import { PhGrupoDuplicarEvent } from '../gerenciar-grupos-duplicar/ph-gerenciar-grupos-duplicar.component';

@Component({
  selector: 'app-ph-gerenciar-grupos',
  templateUrl: './ph-gerenciar-grupos.component.html',
  styleUrls: ['./ph-gerenciar-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class PhGerenciarGruposComponent implements OnInit, OnDestroy {
  constructor(
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private changeDetectorRef: ChangeDetectorRef,
    private bsModalRef: BsModalRef,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private orcamentoService: OrcamentoService,
    private dataGerenciadorGruposService: DataGerenciadorGruposService
  ) {}

  private hasAnyUpdate = false;

  private _destroy$ = new Subject<void>();

  loading = false;

  familia: OrcamentoCenarioFamilia;

  idOrcamento: number;
  idOrcamentoCenario: number;
  idOrcamentoCenarioFamilia: number;
  idOrcamentoFamilia: number;
  descricaoFamilia: string;
  gerenciadorGrupos = false;

  private _grupoes$ = new BehaviorSubject<GrupaoGerenciar[]>([]);
  grupoes$ = this._grupoes$.asObservable();
  hasAnyGrupoLoading$ = this.grupoes$.pipe(
    map(grupoes => grupoes.some(grupao => grupao.grupos.some(grupo => grupo.loading)))
  );

  get snapshot(): GrupaoGerenciar[] {
    return this._grupoes$.value;
  }

  trackByGrupao = trackByFactory<GrupaoGerenciar>('idGrupao');
  trackByGrupo = trackByFactory<GrupoGerenciar>('idOrcamentoGrupo');
  trackByCenario = trackByFactory<CenarioSimples>('idOrcamentoCenario');

  @ViewChildren('complemento', { read: ElementRef }) complementosRef: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('complementoRef', { read: TemplateRef }) complementoTemplate: TemplateRef<any>;
  loadingComplemento = false;
  overlayComplemento: OverlayRef;
  complementoControl = new FormControl();
  complementoControlValue$ = this.complementoControl.valueChanges.pipe(debounceTime(300));

  @ViewChild('duplicarRef', { read: TemplateRef }) duplicarTemplate: TemplateRef<any>;
  overlayDuplicar: OverlayRef;

  loadingDuplicar = false;

  private merge(grupoes: GrupaoGerenciar[]): void {
    const oldGrupoes = this.snapshot;
    this._grupoes$.next(upsert(oldGrupoes, grupoes, 'idGrupao'));
  }

  private createOverlay(elementRef: HTMLElement, config: OverlayConfig = {}): OverlayRef {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      positionStrategy: this.overlay.position().flexibleConnectedTo(elementRef).withPositions(getPositions('left')),
      ...config,
    });
  }

  openDuplicar(elementRef: HTMLElement, grupo: GrupoGerenciar): void {
    this.overlayDuplicar = this.createOverlay(elementRef);
    this.overlayDuplicar.attach(
      new TemplatePortal(this.duplicarTemplate, this.viewContainerRef, {
        $implicit: grupo,
      })
    );
    this.overlayDuplicar
      .backdropClick()
      .pipe(
        takeUntil(this._destroy$),
        filter(() => !this.loadingDuplicar),
        take(1)
      )
      .subscribe(() => {
        this.closeDuplicar();
      });
  }

  openComplementoGrupo(elementRef: HTMLElement, grupo: GrupoGerenciar): void {
    this.overlayComplemento = this.createOverlay(elementRef, { width: 500 });
    this.overlayComplemento.attach(
      new TemplatePortal(this.complementoTemplate, this.viewContainerRef, { $implicit: grupo })
    );
    let complemento = grupo.complementoOrcamentoGrupo;
    if (!complemento) {
      complemento = grupo.principal ? '' : 'Cópia';
    }
    this.complementoControl.setValue(complemento);
    this.overlayComplemento
      .backdropClick()
      .pipe(
        takeUntil(this._destroy$),
        filter(() => !this.loadingComplemento),
        take(1)
      )
      .subscribe(() => {
        this.closeComplemento();
      });
  }

  atualizarComplemento(grupo: GrupoGerenciar): void {
    this.loadingComplemento = true;
    const complementoOrcamentoGrupo = this.complementoControl.value;
    this.complementoControl.disable();
    let requests$ = this.orcamentoService
      .patchOrcamentoGrupo(this.idOrcamento, grupo.idOrcamentoGrupo, { complementoOrcamentoGrupo })
      .pipe(
        finalize(() => {
          this.updateGrupo(grupo.idGrupao, grupo.idOrcamentoGrupo, { complementoOrcamentoGrupo });
          this.loadingComplemento = false;
          this.closeComplemento();
          this.complementoControl.enable();
          this.changeDetectorRef.markForCheck();
        })
      );
    if (this.gerenciadorGrupos) {
      requests$ = requests$.pipe(refresh(this.dataGerenciadorGruposService.getMappeadFamilias(this.idOrcamento)));
    }
    requests$.subscribe();
  }
  duplicar({
    grupo,
    quantidades,
    fornecedor,
    atributos,
  }: PhGrupoDuplicarEvent<GrupoGerenciar>): Observable<OrcamentoGrupo> {
    let request$: Observable<OrcamentoGrupo>;
    if (!this.gerenciadorGrupos) {
      request$ = this.planilhaVendasHibridaService
        .duplicarOrcamentoGrupo(this.idOrcamentoCenario, grupo.idOrcamentoGrupo, fornecedor, atributos, quantidades)
        .pipe(
          refresh(
            this.planilhaVendasHibridaService
              .getGrupoesGerenciar(this.idOrcamentoCenarioFamilia ?? this.familia.idOrcamentoCenarioFamilia)
              .pipe(
                tap(grupoes => {
                  this.merge(grupoes);
                })
              )
          )
        );
    } else {
      request$ = this.dataGerenciadorGruposService
        .duplicarOrcamentoGrupo(this.idOrcamentoCenario, grupo.idOrcamentoGrupo, fornecedor, atributos, quantidades)
        .pipe(
          refresh(
            this.dataGerenciadorGruposService.getGruposDuplicacao(this.idOrcamentoCenarioFamilia).pipe(
              tap(grupoes => {
                this.merge(grupoes);
              })
            )
          ),
          refresh(this.dataGerenciadorGruposService.getMappeadFamilias(this.idOrcamento))
        );
    }
    return request$;
  }

  duplicarGrupo({ grupo, quantidades, fornecedor, atributos }: PhGrupoDuplicarEvent<GrupoGerenciar>): void {
    this.loadingDuplicar = true;
    this.hasAnyUpdate = true;
    this.duplicar({ grupo, quantidades, fornecedor, atributos })
      .pipe(
        tap(() => {
          setTimeout(() => {
            const element = findRight(
              [...this.complementosRef],
              elementRef => +elementRef.nativeElement.getAttribute('idGrupo') === grupo.idGrupo
            )?.nativeElement;
            const grupos: GrupoGerenciar[] = this._grupoes$.value.reduce((acc, item) => [...acc, ...item.grupos], []);
            const lastGrupo = findRight(grupos, g => g.idGrupo === grupo.idGrupo);
            if (element && lastGrupo) {
              this.openComplementoGrupo(element, lastGrupo);
            }
          });
        }),
        finalize(() => {
          this.loadingDuplicar = false;
          this.closeDuplicar();
        })
      )
      .subscribe();
  }

  closeDuplicar(): void {
    this.overlayDuplicar?.detach();
    this.overlayDuplicar?.dispose();
  }

  closeComplemento(): void {
    this.overlayComplemento?.detach();
    this.overlayComplemento?.dispose();
  }

  getGrupaoSnapshot(idGrupao: number): GrupaoGerenciar {
    return this.snapshot.find(grupao => grupao.idGrupao === idGrupao);
  }

  getGrupoes(): void {
    this.loading = true;
    let request$: Observable<GrupaoGerenciar[]>;

    if (this.gerenciadorGrupos) {
      request$ = this.dataGerenciadorGruposService.getGruposDuplicacao(this.idOrcamentoCenarioFamilia);
    } else {
      request$ = this.planilhaVendasHibridaService.getGrupoesGerenciar(
        this.idOrcamentoCenarioFamilia ?? this.familia.idOrcamentoCenarioFamilia
      );
    }
    request$
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(grupoes => this._grupoes$.next(grupoes));
  }

  private updateGrupao(
    idGrupao: number | ((grupao: GrupaoGerenciar) => boolean),
    partial: ((grupao: GrupaoGerenciar) => GrupaoGerenciar) | Partial<GrupaoGerenciar>
  ): void {
    const predicate = isFunction(idGrupao) ? idGrupao : grupo => grupo.idGrupao === idGrupao;
    const callback = isFunction(partial) ? partial : grupao => ({ ...grupao, ...partial });
    this._grupoes$.next(
      this._grupoes$.value.map(grupao => {
        if (predicate(grupao)) {
          grupao = callback(grupao);
        }
        return grupao;
      })
    );
  }

  private updateGrupo(
    idGrupao: number,
    idOrcamentoGrupo: number | ((grupo: GrupoGerenciar) => boolean),
    partial: ((grupo: GrupoGerenciar) => GrupoGerenciar) | Partial<GrupoGerenciar>
  ): void {
    const predicate = isFunction(idOrcamentoGrupo)
      ? idOrcamentoGrupo
      : grupo => grupo.idOrcamentoGrupo === idOrcamentoGrupo;
    const callback = isFunction(partial) ? partial : grupo => ({ ...grupo, ...partial });
    this.updateGrupao(idGrupao, grupao => ({
      ...grupao,
      grupos: grupao.grupos.map(grupo => {
        if (predicate(grupo)) {
          grupo = callback(grupo);
        }
        return grupo;
      }),
    }));
  }

  toggleCollapse(idGrupao: number): void {
    this.updateGrupao(idGrupao, grupao => ({ ...grupao, opened: !grupao.opened }));
  }

  toggleOrigin(grupao: GrupaoGerenciar, idGrupo: number, $event: boolean): void {
    const gruposAtivos = grupao.grupos.filter(grupo => grupo.idGrupo === idGrupo && grupo.ativo);
    if ($event || !gruposAtivos.length) {
      this.updateGrupo(grupao.idGrupao, grupo => grupo.idGrupo === idGrupo, { enabled: true });
      return;
    }
    this.hasAnyUpdate = true;
    this.updateGrupo(grupao.idGrupao, grupo => grupo.idGrupo === idGrupo, { loading: true });
    const request$ = gruposAtivos.map(og =>
      this.planilhaVendasHibridaService.toggleAtivoOrcamentoCenarioGrupo(og.idOrcamentoCenarioGrupo)
    );
    forkJoin(request$)
      .pipe(
        finalize(() => {
          this.updateGrupo(grupao.idGrupao, grupo => grupo.idGrupo === idGrupo, {
            loading: false,
            ativo: false,
            enabled: false,
          });
        })
      )
      .subscribe();
  }

  toggleGrupo(idGrupao: number, grupo: GrupoGerenciar): void {
    if (grupo.ativo) {
      return;
    }
    this.hasAnyUpdate = true;
    this.updateGrupo(idGrupao, g => g.idGrupo === grupo.idGrupo, { loading: true });
    const gruposAtivos = this.getGrupaoSnapshot(idGrupao).grupos.filter(g => g.idGrupo === grupo.idGrupo && g.ativo);
    const desativarGruposAnteriores$ = gruposAtivos.length
      ? forkJoin(
          gruposAtivos.map(grupoAtivo =>
            this.planilhaVendasHibridaService.toggleAtivoOrcamentoCenarioGrupo(grupoAtivo.idOrcamentoCenarioGrupo)
          )
        )
      : of(null);
    const ativarGrupo$ = this.planilhaVendasHibridaService.toggleAtivoOrcamentoCenarioGrupo(
      grupo.idOrcamentoCenarioGrupo
    );
    forkJoin([desativarGruposAnteriores$, ativarGrupo$])
      .pipe(
        tap(() => {
          this.updateGrupo(
            idGrupao,
            g => g.idGrupo === grupo.idGrupo,
            g => ({ ...g, ativo: grupo.idOrcamentoGrupo === g.idOrcamentoGrupo })
          );
        }),
        finalize(() => {
          this.updateGrupo(idGrupao, g => g.idGrupo === grupo.idGrupo, { loading: false });
        })
      )
      .subscribe();
  }

  getCenarios(grupo: GrupoGerenciar, popover: PopoverDirective): void {
    if (grupo.cenarios.length) {
      popover.show();
      return;
    }
    this.updateGrupo(grupo.idGrupao, grupo.idOrcamentoGrupo, { loadingCenarios: true });
    this.planilhaVendasHibridaService
      .getCenariosGrupo(grupo.idOrcamentoGrupo)
      .pipe(
        finalize(() => {
          this.updateGrupo(grupo.idGrupao, grupo.idOrcamentoGrupo, { loadingCenarios: false });
        })
      )
      .subscribe(cenarios => {
        this.updateGrupo(grupo.idGrupao, grupo.idOrcamentoGrupo, { cenarios });
        popover.show();
      });
  }

  close(): void {
    if (
      this.loadingDuplicar ||
      this.loading ||
      this._grupoes$.value.some(grupao => grupao.grupos.some(grupo => grupo.loading))
    ) {
      return;
    }
    let reload$: Observable<any>;
    if (this.hasAnyUpdate) {
      this.loading = true;
      reload$ = this.planilhaVendasHibridaService.getCenario(this.idOrcamentoCenario, this.idOrcamento).pipe(
        this.planilhaVendasHibridaService.refreshTotalFamilia(
          this.idOrcamentoCenarioFamilia ?? this.familia.idOrcamentoCenarioFamilia,
          this.idOrcamentoCenario ?? this.familia.idOrcamentoCenario
        ),
        refresh(this.orcamentoService.refreshOrcamento(this.idOrcamento, this.idOrcamentoCenario)),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      );
    } else {
      reload$ = of(null);
    }
    reload$
      .pipe(
        finalize(() => {
          this.bsModalRef.hide();
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.descricaoFamilia ??= this.familia.orcamentoFamilia.familia.descricaoFamilia;
    this.getGrupoes();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.closeDuplicar();
    this.closeComplemento();
  }
}
