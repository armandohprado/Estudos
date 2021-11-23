import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  TrackByFunction,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { PcResponsabilidadeEnum, PcResponsavel } from '../../models/pc-responsavel';
import { ICellEditorParamsCustom } from '../../util/grid-custom-models';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { PcResponsavelService } from '../../state/responsavel/pc-responsavel.service';
import { PcResponsavelQuery } from '../../state/responsavel/pc-responsavel.query';
import { debounceTime, finalize, map, takeUntil } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AW_SELECT_POSITIONS } from '@aw-components/aw-select/aw-select.config';
import { TemplatePortal } from '@angular/cdk/portal';
import { FormControl } from '@angular/forms';
import { PlanoComprasService } from '../../state/plano-compras/plano-compras.service';

export interface PcGridResponsaveisCellEditorParams extends ICellEditorParamsCustom<PcResponsavel> {
  responsabilidade?: PcResponsabilidadeEnum;
}

@Component({
  selector: 'app-pc-grid-responsaveis',
  templateUrl: './pc-grid-responsaveis.component.html',
  styleUrls: ['./pc-grid-responsaveis.component.scss'],
})
export class PcGridResponsaveisComponent implements OnInit, ICellEditorAngularComp, AfterViewInit, OnDestroy {
  constructor(
    private pcResponsavelService: PcResponsavelService,
    private pcResponsavelQuery: PcResponsavelQuery,
    private overlay: Overlay,
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private planoComprasService: PlanoComprasService
  ) {}

  private _destroy$ = new Subject<void>();

  pcResponsabilidadeEnum = PcResponsabilidadeEnum;

  params: PcGridResponsaveisCellEditorParams;
  selecionado: PcResponsavel;
  responsaveis$: Observable<PcResponsavel[]>;
  loading$: Observable<boolean>;
  loadingBehavior$ = new BehaviorSubject<boolean>(false);
  selecionados: number[] = [];
  searchControl = new FormControl();
  flagSelectAll = false;
  flagSelectGroup = false;
  responsavelSelecionado: PcResponsavel = null;
  search$ = this.searchControl.valueChanges.pipe(debounceTime(499));

  overlayRef: OverlayRef;

  @ViewChild('overlay', { static: false })
  templateRef: TemplateRef<any>;

  trackBy: TrackByFunction<PcResponsavel> = (_, responsavel) => responsavel.id;

  selectResponsavel(responsavel: PcResponsavel): void {
    if (this.selecionados.length >= 1 && this.flagSelectGroup) {
      this.planoComprasService
        .putResponsavelArray(
          this.selecionados,
          this.params.responsabilidade,
          responsavel.id,
          this.params.colDef.field,
          this.params.data.idOrcamentoCenario
        )
        .pipe(
          finalize(() => {
            this.selecionado = responsavel;
            this.params.stopEditing();
          })
        )
        .subscribe();
    } else {
      this.planoComprasService
        .putResponsavel(
          this.params.data.idPlanoCompraGrupo,
          this.params.responsabilidade,
          responsavel.id,
          this.flagSelectAll,
          this.params.colDef.field
        )
        .pipe(
          finalize(() => {
            this.selecionado = responsavel;
            this.params.stopEditing();
          })
        )
        .subscribe();
    }
  }
  checkSelectGroup(): void {
    this.flagSelectAll = false;
    this.flagSelectGroup = !this.flagSelectGroup;
  }
  checkSelectAll(): void {
    this.flagSelectGroup = false;
    this.flagSelectAll = !this.flagSelectAll;
  }
  selecionarResponsavel(responsavel: PcResponsavel): void {
    this.responsavelSelecionado = responsavel ?? null;
  }
  isPopup(): boolean {
    return false;
  }

  getValue(): any {
    return this.selecionado;
  }

  agInit(params: PcGridResponsaveisCellEditorParams): void {
    this.params = params;
    this.selecionado = params.value ? { ...params.value } : null;
    this.selecionados = [params.data.idPlanoCompraGrupo];
  }

  ngOnInit(): void {
    this.pcResponsavelService.setByResponsabilidadeApi(this.params.responsabilidade);

    this.responsaveis$ = this.pcResponsavelQuery
      .getByResponsabilidade(this.params.responsabilidade)
      .pipe(map(responsaveis => responsaveis.filter(responsavel => this.params.value?.id !== responsavel.id)));
    this.loading$ = this.pcResponsavelQuery.selectLoading();
  }

  ngAfterViewInit(): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      width: 740,
      height: 400,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef.nativeElement)
        .withPositions(
          AW_SELECT_POSITIONS.map(o => ({
            ...o,
            offsetY: o.originY === 'bottom' ? -30 : 0,
          }))
        ),
    });
    this.overlayRef
      .backdropClick()
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.params.stopEditing();
      });
    this.overlayRef.attach(new TemplatePortal(this.templateRef, this.viewContainerRef));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.overlayRef.detach();
  }
}
