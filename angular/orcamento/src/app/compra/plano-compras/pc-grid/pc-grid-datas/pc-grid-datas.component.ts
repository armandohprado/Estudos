import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { AW_SELECT_POSITIONS } from '@aw-components/aw-select/aw-select.config';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { PlanoComprasService } from '../../state/plano-compras/plano-compras.service';
import { PcDatasPlanejamentoEnum } from '../../models/plano-compras';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { PcGridCellEditorParams } from '../pc-grid-custom/pc-grid-cell-editor/pc-grid-cell-editor.component';
import { isEqual } from 'date-fns';

@Component({
  selector: 'app-pc-grid-datas',
  templateUrl: './pc-grid-datas.component.html',
  styleUrls: ['./pc-grid-datas.component.scss'],
})
export class PcGridDatasComponent implements OnInit, AfterViewInit, OnDestroy, ICellEditorAngularComp {
  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private planoComprasService: PlanoComprasService
  ) {}

  private _destroy$ = new Subject<void>();
  @ViewChild('overlay') templateRef: TemplateRef<any>;

  overlayRef: OverlayRef;

  params: PcGridCellEditorParams<Date>;

  loading = false;

  flagSelectAll = false;
  selecionados: number[] = [];
  datasPlanejamentoEnum = PcDatasPlanejamentoEnum;
  bsInlineValue: Date;
  dataSelecionada: Date = null;

  selectData(event: Date): void {
    if (
      (isEqual(event, this.params.data[this.params.colDef.field as string]) ||
        !this.params.data[this.params.colDef.field]) &&
      !event
    ) {
      return;
    }
    this.dataSelecionada = event;
  }
  enviarData(): void {
    this.loading = true;
    this.bsInlineValue = new Date(this.dataSelecionada) ?? new Date();
    this.planoComprasService
      .putDatas(
        this.selecionados,
        this.dataSelecionada,
        this.params.colDef.field,
        !!this.flagSelectAll ? this.params.data.idOrcamentoCenario : 0,
        this.datasPlanejamentoEnum[this.params.colDef.field]
      )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.params.stopEditing();
        })
      )
      .subscribe();
  }
  ngOnInit(): void {}
  agInit(params: PcGridCellEditorParams<Date>): void {
    this.params = params;
    this.selecionados = [params.data.idPlanoCompraGrupo];
  }
  ngAfterViewInit(): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      width: 740,
      height: 410,
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
      .pipe(take(1), takeUntil(this._destroy$))
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

  getValue(): any {
    return this.bsInlineValue;
  }
}
