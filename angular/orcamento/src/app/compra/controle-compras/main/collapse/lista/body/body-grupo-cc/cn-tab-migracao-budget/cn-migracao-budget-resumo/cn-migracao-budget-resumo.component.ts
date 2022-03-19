import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CnMigracaoBudgetGrupoResumo } from '../../../../../../../../models/cn-migracao-budget-resumo';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-cn-migracao-budget-resumo',
  templateUrl: './cn-migracao-budget-resumo.component.html',
  styleUrls: ['./cn-migracao-budget-resumo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnMigracaoBudgetResumoComponent {
  @Input() gruposResumo: CnMigracaoBudgetGrupoResumo[];
  @Input() cedido = false;
  @Input() total = 0;

  trackBy = trackByFactory<CnMigracaoBudgetGrupoResumo>('idCompraNegociacaoGrupoMigracaoBudget');
}
