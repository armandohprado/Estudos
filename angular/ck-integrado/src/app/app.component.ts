import { ChangeDetectionStrategy, Component } from '@angular/core';
import { environment } from '@aw-environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  isBuild = environment.build;
}
