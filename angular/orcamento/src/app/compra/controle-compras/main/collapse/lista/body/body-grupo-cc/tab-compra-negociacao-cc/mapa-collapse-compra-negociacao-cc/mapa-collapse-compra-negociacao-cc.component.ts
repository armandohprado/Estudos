import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CnGrupo } from '../../../../../../../../models/cn-grupo';

@Component({
  selector: 'app-mapa-collapse-compra-negociacao-cc',
  templateUrl: './mapa-collapse-compra-negociacao-cc.component.html',
  styleUrls: ['./mapa-collapse-compra-negociacao-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaCollapseCompraNegociacaoCcComponent {
  @Input() grupo: CnGrupo;
}
