import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { TipoGrupoEnum } from '@aw-models/tipo-grupo.enum';

export interface PhGrupoDuplicar {
  idTipoGrupo: number;
}

export interface PhGrupoDuplicarEvent<T extends PhGrupoDuplicar> {
  fornecedor: boolean;
  quantidades: boolean;
  atributos: boolean;
  grupo: T;
}

@Component({
  selector: 'app-ph-gerenciar-grupos-duplicar',
  templateUrl: './ph-gerenciar-grupos-duplicar.component.html',
  styleUrls: ['./ph-gerenciar-grupos-duplicar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhGerenciarGruposDuplicarComponent<T extends PhGrupoDuplicar> {
  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  @Input() grupo: T;
  @Input() loading: boolean;

  @Input() fornecedor = false;
  @Input() quantidades = false;
  @Input() atributos = false;

  @Input() disabledFornecedor = false;
  @Input() disabledQuantidades = false;
  @Input() disabledAtributos = false;

  readonly tipoGrupoEnum = TipoGrupoEnum;

  @Output() readonly duplicar = new EventEmitter<PhGrupoDuplicarEvent<T>>();
  @Output() readonly closeDuplicar = new EventEmitter<void>();

  isLoja(): boolean {
    return [TipoGrupoEnum.Loja, TipoGrupoEnum.Insumo, TipoGrupoEnum.InsumoKit].includes(this.grupo.idTipoGrupo);
  }

  onChangeFornecedor($event: boolean): void {
    this.fornecedor = $event;
    if (this.isLoja()) {
      this.quantidades = $event;
      this.disabledQuantidades = $event;
    }
    this.changeDetectorRef.markForCheck();
  }

  onChange<K extends keyof Pick<this, 'fornecedor' | 'quantidades' | 'atributos'>>(key: K, $event: boolean): void {
    this[key] = $event;
    this.changeDetectorRef.markForCheck();
  }

  onDuplicar(): void {
    const { atributos, quantidades, fornecedor, grupo } = this;
    this.duplicar.emit({ atributos, fornecedor, grupo, quantidades });
  }
}
