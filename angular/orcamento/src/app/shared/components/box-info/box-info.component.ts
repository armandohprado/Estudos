import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { fadeInOutAnimation } from '../../animations/fadeOut';

@Component({
  selector: 'app-box-info',
  templateUrl: './box-info.component.html',
  styleUrls: ['./box-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOutAnimation()],
})
export class BoxInfoComponent {
  @Input() label: string;
  @Input() classList: string[] | string;
  @Input() valor: string | number;
  @Input() boxWidth = 330;
}
