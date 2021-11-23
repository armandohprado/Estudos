import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { fadeInOutAnimation } from '@aw-shared/animations/fadeOut';
import { CurvaAbcGrupo } from '../../../models';

@Component({
  selector: 'app-header-curva',
  templateUrl: './header-curva.component.html',
  styleUrls: ['./header-curva.component.scss'],
  animations: [fadeInOutAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderCurvaComponent {
  constructor() {}

  @Input() curvaAbcGrupos: CurvaAbcGrupo[];
  @Input() totalFiltrado: number;
  @Input() totalGoalValue: number;
  @Input() totalEstimatedValue: number;
}
