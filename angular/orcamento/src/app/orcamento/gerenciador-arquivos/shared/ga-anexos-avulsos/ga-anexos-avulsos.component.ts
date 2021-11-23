import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GaAnexoAvulso } from '../../model/anexo-avulso';
import { trackByFactory } from '../../../../utils/track-by';

@Component({
  selector: 'app-ga-anexos-avulsos',
  templateUrl: './ga-anexos-avulsos.component.html',
  styleUrls: ['./ga-anexos-avulsos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaAnexosAvulsosComponent implements OnInit {
  constructor() {}

  @Input()
  get anexos(): GaAnexoAvulso[] {
    return this._anexos;
  }
  set anexos(value: GaAnexoAvulso[]) {
    this._anexos = value ?? [];
    this.allSelected = this._anexos.every(anexo => anexo.ativo);
    this.allIndeterminate = !this.allSelected && this._anexos.some(anexo => anexo.ativo);
  }
  private _anexos: GaAnexoAvulso[];

  allIndeterminate = false;
  allSelected = false;

  @Input() apenasSelecionados: boolean;
  @Input() readonly: boolean;
  @Input() allowSelectAll: boolean;
  @Input() allSelectDisabled: boolean;

  @Output() anexoToggle = new EventEmitter<[boolean, GaAnexoAvulso]>();
  @Output() allToggle = new EventEmitter<[boolean, GaAnexoAvulso[]]>();
  @Output() download = new EventEmitter<GaAnexoAvulso>();

  trackBy = trackByFactory<GaAnexoAvulso>('idOrcamentoGrupoAnexo');

  onDownload(anexo: GaAnexoAvulso): void {
    this.download.emit(anexo);
  }

  toggleAnexo($event: boolean, anexo: GaAnexoAvulso): void {
    if (this.readonly) {
      return;
    }
    this.anexoToggle.emit([$event, anexo]);
  }

  toggleAll($event: boolean): void {
    if (this.readonly) {
      return;
    }
    const anexos = this._anexos.filter(anexo => anexo.ativo !== $event);
    this.allToggle.emit([$event, anexos]);
  }

  ngOnInit(): void {}
}
