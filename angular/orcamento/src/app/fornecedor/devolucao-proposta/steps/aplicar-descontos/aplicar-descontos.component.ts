import { Component, Input } from '@angular/core';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';

@Component({
  selector: 'app-aplicar-descontos',
  templateUrl: './aplicar-descontos.component.html',
  styleUrls: ['./aplicar-descontos.component.scss'],
})
export class AplicarDescontosComponent {
  constructor(public devolucaoPropostaService: DevolucaoPropostaService) {}

  @Input() supply: boolean;
  @Input() interno: boolean;
}
