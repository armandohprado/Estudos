import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { GrupoTransferencia } from '@aw-models/controle-compras/grupo-transferencia';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-transferir-saldo-grupos',
  templateUrl: './transferir-saldo-grupos.component.html',
  styleUrls: ['./transferir-saldo-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferirSaldoGruposComponent {
  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  @Input() grupos: GrupoTransferencia[] = [];
  @Input() updateGrupo: boolean;
  @Input() readonlyGruposView: boolean;
  @Input() filterGrupoMultiple: boolean;
  @Input() statusGrupos: Record<number, AwInputStatus> = {};
  @Output() changeValue = new EventEmitter<GrupoTransferencia>();
  @Input() useBloqueado: boolean;
  @Input() hideTotal: boolean;
  @Input() isValid = true;
  @Input() itemsPerPage = 25;

  currentPage = 1;
  filtroGrupo: string[] | string;

  readonly trackByGruposTransferencia = trackByFactory<GrupoTransferencia>('idCompraNegociacaoGrupo');

  changeValueGroup(valorDigitado: number, grupoTransferencia: GrupoTransferencia): void {
    const saldo =
      grupoTransferencia.valorSaldo === 0
        ? grupoTransferencia.valorSaldoContingenciaReservado
        : grupoTransferencia.valorSaldo;
    if (valorDigitado > saldo) {
      valorDigitado = saldo;
    }
    this.changeValue.emit({ ...grupoTransferencia, transferencia: +valorDigitado });
    if (this.updateGrupo) {
      this.grupos = this.grupos.map(grupo => {
        if (grupoTransferencia.codigo === grupo.codigo) {
          grupoTransferencia = { ...grupoTransferencia, transferencia: +valorDigitado };
        }
        return grupo;
      });
      this.changeDetectorRef.markForCheck();
    }
  }
}
