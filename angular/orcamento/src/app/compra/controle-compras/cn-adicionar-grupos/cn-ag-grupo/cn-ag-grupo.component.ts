import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CnAgGrupo } from '../../../models/cn-adicionar-grupos';
import { isFunction } from 'lodash-es';
import { TipoGrupoEnum } from '@aw-models/tipo-grupo.enum';

@Component({
  selector: 'app-cn-ag-grupo',
  templateUrl: './cn-ag-grupo.component.html',
  styleUrls: ['./cn-ag-grupo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnAgGrupoComponent {
  @Input() grupo: CnAgGrupo;
  @Output() readonly grupoChange = new EventEmitter<CnAgGrupo>();

  readonly tipoGrupoEnum = TipoGrupoEnum;

  private _updateGrupo(partial: Partial<CnAgGrupo> | ((grupo: CnAgGrupo) => CnAgGrupo)): void {
    const update = isFunction(partial) ? partial : (grupo: CnAgGrupo) => ({ ...grupo, ...partial });
    this.grupoChange.emit(update(this.grupo));
  }

  onSelect($event: boolean): void {
    this._updateGrupo({ selecionado: $event });
  }

  onGrupoNaoPrevistoChange($event: boolean): void {
    this._updateGrupo({ grupoNaoPrevisto: $event });
  }

  onDuplicar(): void {
    this._updateGrupo({
      duplicar: true,
      duplicarAtributos: false,
      duplicarQuantidades: false,
      duplicarFornecedor: false,
    });
  }

  onChangeDuplicarFornecedor($event: boolean): void {
    const update: Partial<CnAgGrupo> = { duplicarFornecedor: $event };
    if ([TipoGrupoEnum.Loja, TipoGrupoEnum.Insumo, TipoGrupoEnum.InsumoKit].includes(this.grupo.idTipoGrupo)) {
      update.duplicarAtributos = $event;
      update.duplicarQuantidades = $event;
    }
    this._updateGrupo(update);
  }

  onChangeDuplicarAtributos($event: boolean): void {
    this._updateGrupo({ duplicarAtributos: $event });
  }

  onChangeDuplicarQuantidado($event: boolean): void {
    this._updateGrupo({ duplicarQuantidades: $event });
  }

  onCancelarDuplicar(): void {
    this._updateGrupo({ duplicar: false });
  }
}
