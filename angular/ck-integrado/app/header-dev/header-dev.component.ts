import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-header-dev',
  templateUrl: './header-dev.component.html',
  styleUrls: ['./header-dev.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderDevComponent {}
