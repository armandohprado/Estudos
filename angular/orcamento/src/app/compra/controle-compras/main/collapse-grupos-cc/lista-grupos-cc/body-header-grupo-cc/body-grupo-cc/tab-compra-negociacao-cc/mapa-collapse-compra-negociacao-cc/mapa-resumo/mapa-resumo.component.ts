import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CnGrupo, CnTipoGrupoEnum } from '../../../../../../../../../models/cn-grupo';

@Component({
  selector: 'app-mapa-resumo',
  templateUrl: './mapa-resumo.component.html',
  styleUrls: ['./mapa-resumo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaResumoComponent {
  @Input() grupo: CnGrupo;

  tipo = CnTipoGrupoEnum;
}
