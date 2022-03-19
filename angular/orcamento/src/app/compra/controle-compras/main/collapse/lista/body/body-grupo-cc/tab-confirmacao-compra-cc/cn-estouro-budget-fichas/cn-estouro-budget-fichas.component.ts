import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CnFichaAlt } from '../../../../../../../../models/cn-ficha-alt';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-cn-estouro-budget-fichas',
  templateUrl: './cn-estouro-budget-fichas.component.html',
  styleUrls: ['./cn-estouro-budget-fichas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnEstouroBudgetFichasComponent {
  @Input() fichas: CnFichaAlt[] = [];

  trackBy = trackByFactory<CnFichaAlt>('idOrcamentoGrupoFicha');
}
