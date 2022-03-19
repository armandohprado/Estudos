import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { CnGrupo } from '../../../../../../../../models/cn-grupo';
import { CcGrupoService } from '../../../../../../../state/grupos/cc-grupo.service';
import { CnMigracaoBudgetGrupo } from '../../../../../../../../models/cn-migracao-budget-grupo';
import { CnMigracaoBudgetPayload } from '../../../../../../../../models/cn-migracao-budget';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cn-migracao-budget-grupos-transferencia',
  templateUrl: './cn-migracao-budget-grupos-transferencia.component.html',
  styleUrls: ['./cn-migracao-budget-grupos-transferencia.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnMigracaoBudgetGruposTransferenciaComponent {
  constructor(private ccGrupoService: CcGrupoService, private changeDetectorRef: ChangeDetectorRef) {}

  @Input() grupo: CnGrupo;

  saving = false;

  updateTransferenciaGrupo(grupoTransferencia: CnMigracaoBudgetGrupo): void {
    grupoTransferencia = {
      ...grupoTransferencia,
      valorSaldoUtilizado:
        (grupoTransferencia.valorSaldoContingenciaReservado === 0
          ? grupoTransferencia.valorSaldo
          : grupoTransferencia.valorSaldoContingenciaReservado) - grupoTransferencia.transferencia,
    };
    this.ccGrupoService.updateMigracaoBudgetGrupoTransferencia(this.grupo.idCompraNegociacaoGrupo, grupoTransferencia);
  }

  migrar(): void {
    this.saving = true;
    const payload: CnMigracaoBudgetPayload = {
      idCompraNegociacaoGrupo: this.grupo.idCompraNegociacaoGrupo,
      compraNegociacaoGrupoMigracaoBudget: this.grupo.migracaoBudgetGruposTransferencia
        .filter(grupo => grupo.transferencia > 0)
        .map(grupo => ({ idCompraNegociacaoGrupoOrigem: grupo.idCompraNegociacaoGrupo, valor: grupo.transferencia })),
    };
    this.ccGrupoService
      .postMigracaoBudget(this.grupo.idCompraNegociacao, this.grupo.tipo, payload)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }
}
