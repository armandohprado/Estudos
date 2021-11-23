import { Component, Input, OnInit } from '@angular/core';
import { Cenario } from '../models/cenario';
import { PlanilhaVendasHibridaService } from '../planilha-vendas-hibrida.service';

@Component({
  selector: 'app-taxas',
  templateUrl: './taxas.component.html',
  styleUrls: ['./taxas.component.scss'],
})
export class TaxasComponent implements OnInit {
  constructor(public planilhaVendasHibridaService: PlanilhaVendasHibridaService) {}

  @Input() idOrcamentoCenario: number;
  @Input() cenario: Cenario;
  @Input() isChangeOrder: boolean;
  @Input() readonly = false;
  @Input() gruposOpcionais = false;

  ngOnInit(): void {}
}
