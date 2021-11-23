import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ICellEditorParamsCustom } from '../../../util/grid-custom-models';
import { AwFilterType } from '@aw-components/aw-filter/aw-filter.type';
import { Observable, Subject } from 'rxjs';
import { AwSelectBindLabel } from '@aw-components/aw-select/aw-select.type';
import { PlanoComprasQuery } from '../../../state/plano-compras/plano-compras.query';
import { AwSelectComponent } from '@aw-components/aw-select/aw-select.component';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { FormControl } from '@angular/forms';
import { KeyofPlanoCompras } from '../../../models/plano-compras';
import { PlanoComprasService } from '../../../state/plano-compras/plano-compras.service';

export interface PcGridCellEditorParams<T = any> extends ICellEditorParamsCustom<T> {
  type: AwFilterType | 'select';
  textarea?: boolean;
  selectItems?: Observable<T[]>;
  selectLoading?: Observable<boolean>;
  selectOptions?: {
    bindLabel?: AwSelectBindLabel;
  };
  placeholder?: string;
  comentario?: KeyofPlanoCompras;
  placeholderComentario?: string;
}

@Component({
  selector: 'app-pc-grid-cell-editor',
  templateUrl: './pc-grid-cell-editor.component.html',
  styleUrls: ['./pc-grid-cell-editor.component.scss'],
})
export class PcGridCellEditorComponent implements OnInit, OnDestroy, ICellEditorAngularComp {
  constructor(private planoComprasQuery: PlanoComprasQuery, private planoComprasService: PlanoComprasService) {}

  private _destroy$ = new Subject<void>();

  @ViewChild('input', { static: false })
  inputRef: ElementRef<HTMLInputElement>;

  @ViewChild('select', { static: false })
  selectRef: AwSelectComponent;

  params: PcGridCellEditorParams;
  status$: Observable<AwInputStatus>;

  valueControl: FormControl;
  comentarioControl: FormControl;

  onKeyDown($event: KeyboardEvent): void {
    if ($event.key !== 'Tab') {
      $event.stopPropagation();
    }
  }
  agInit(params: PcGridCellEditorParams): void {
    this.params = params;
    this.valueControl = new FormControl(this.params.value);
    if (this.params.comentario) {
      this.comentarioControl = new FormControl(this.params.data[this.params.comentario]);
    }

    this.status$ = this.planoComprasQuery.getStatus(this.params.data.id, this.params.colDef.field);
    setTimeout(() => {
      this.inputRef?.nativeElement?.focus();
    });
  }

  getValue(): any {
    if (this.params.comentario) {
      this.planoComprasService.putComentarioMetaCompra(
        this.params.data.id,
        this.comentarioControl.value,
        this.params.node
      );
    }
    return this.valueControl.value;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
