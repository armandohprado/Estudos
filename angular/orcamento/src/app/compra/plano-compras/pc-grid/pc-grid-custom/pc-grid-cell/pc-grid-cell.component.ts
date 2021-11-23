import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParamsCustom } from '../../../util/grid-custom-models';
import { AwFilterType } from '@aw-components/aw-filter/aw-filter.type';
import { KeyofPlanoCompras } from '../../../models/plano-compras';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { PlanoComprasQuery } from '../../../state/plano-compras/plano-compras.query';
import { PcCabecalhoQuery } from '../../../state/cabecalho/pc-cabecalho.query';

export interface PcGridCellRendererParams<T = any> extends ICellRendererParamsCustom {
  type: AwFilterType | 'select';
  comentario?: KeyofPlanoCompras;
  otherInfo?: KeyofPlanoCompras;
  otherInfoIcon?: string;
  otherInfoIconEmpty?: string;
  otherInfoJustify?: 'start' | 'end' | 'center';
  bold?: boolean;
  fontColor?: 'light' | 'dark';
  allowsDel: boolean;
}

@Component({
  selector: 'app-pc-grid-cell',
  templateUrl: './pc-grid-cell.component.html',
  styleUrls: ['./pc-grid-cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PcGridCellComponent implements ICellRendererAngularComp, OnInit, OnDestroy {
  constructor(private planoComprasQuery: PlanoComprasQuery, public pcCabecalhoQuery: PcCabecalhoQuery) {}

  private _destroy$ = new Subject<void>();

  params: PcGridCellRendererParams;
  status$: Observable<AwInputStatus>;

  timeoutOverlay: any;
  isOverlayOpen = false;
  overlayPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
    },
  ];

  onDelete(): void {
    this.params.colDef.onDelete(this.params);
  }

  overlay(overlay: boolean): void {
    clearTimeout(this.timeoutOverlay);
    this.timeoutOverlay = setTimeout(() => {
      this.isOverlayOpen = overlay;
    }, 100);
  }

  refresh(params: any): boolean {
    return false;
  }

  agInit(params: PcGridCellRendererParams): void {
    this.params = params;
    this.status$ = this.planoComprasQuery.getStatus(this.params.data.id, this.params.colDef.field);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
