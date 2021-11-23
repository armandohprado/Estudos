import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { PlanilhaVendasHibridaService } from '../planilha-vendas-hibrida.service';
import { Cenario } from '../models/cenario';

@Component({
  selector: 'app-header-planilha-vendas-hibrida',
  templateUrl: './header-planilha-vendas-hibrida.component.html',
  styleUrls: ['./header-planilha-vendas-hibrida.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderPlanilhaVendasHibridaComponent implements OnInit {
  constructor(public planilhaVendasHibridaService: PlanilhaVendasHibridaService) {}

  @Input() isChangeOrder: boolean;
  @Input() cenario: Cenario;

  header$ = this.planilhaVendasHibridaService.header$.asObservable();

  ngOnInit(): void {}
}
