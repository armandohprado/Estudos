import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CnTipoGrupoEnum } from '../../../../../models/cn-grupo';
import { CcSort } from '@aw-models/controle-compras/controle-compras.model';

@Component({
  selector: 'app-header-grupo-cc',
  templateUrl: './header-grupo-cc.component.html',
  styleUrls: ['./header-grupo-cc.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderGrupoCcComponent {
  @Input() tipo: CnTipoGrupoEnum;
  @Input() sort: CcSort;

  cnTipoGrupoEnum = CnTipoGrupoEnum;
}
