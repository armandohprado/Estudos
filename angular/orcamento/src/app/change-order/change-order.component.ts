import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-change-order',
  templateUrl: './change-order.component.html',
  styleUrls: ['./change-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeOrderComponent {}
