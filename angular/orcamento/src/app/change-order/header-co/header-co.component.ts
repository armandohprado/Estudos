import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChangeOrderService } from '../services/change-order.service';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Component({
  selector: 'app-header-co',
  templateUrl: './header-co.component.html',
  styleUrls: ['./header-co.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderCoComponent {
  constructor(private changeOrderService: ChangeOrderService, private projetoService: ProjetoService) {}

  readonly headerInfo$ = this.changeOrderService.header$.asObservable();
  readonly projeto$ = this.projetoService.projeto$;
  expanded = false;
}
