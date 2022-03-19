import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ControleComprasQuery } from '../../state/controle-compras/controle-compras.query';
import { ControleComprasService } from '../../state/controle-compras/controle-compras.service';
import { CnTipoGrupoEnum } from '../../../models/cn-grupo';
import { collapseAnimation } from '@aw-shared/animations/collapse';

@Component({
  selector: 'app-collapse-grupos-cc',
  templateUrl: './collapse-grupos-cc.component.html',
  styleUrls: ['./collapse-grupos-cc.component.scss'],
  animations: [collapseAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapseGruposCcComponent {
  constructor(
    public controleComprasQuery: ControleComprasQuery,
    public controleComprasService: ControleComprasService
  ) {}

  @Input() idOrcamentoCenario: number;

  tipoGrupoEnum = CnTipoGrupoEnum;

  collapseDir(collapseDireto: boolean): void {
    this.controleComprasService.collapseDireto(collapseDireto, this.idOrcamentoCenario).subscribe();
  }

  collapseRef(collapseRefaturado: boolean): void {
    this.controleComprasService.collapseRefaturado(collapseRefaturado, this.idOrcamentoCenario).subscribe();
  }
}
