import { Component, Input } from '@angular/core';
import { Pavimento } from '@aw-models/devolucao-proposta/pavimento-dp';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { trackByFactory } from '@aw-utils/track-by';
import { Andar } from '@aw-models/devolucao-proposta/andar-dp';
import { Edificio } from '@aw-models/devolucao-proposta/edificio-dp';
import { Site } from '@aw-models/devolucao-proposta/site-dp';

@Component({
  selector: 'app-edificio',
  templateUrl: './edificio.component.html',
  styleUrls: ['./edificio.component.scss'],
})
export class EdificioComponent {
  @Input() proposta: Pavimento;
  toggleAccordion = true;

  constructor(public devolucaoProposta: DevolucaoPropostaService) {}

  trackByAndar = trackByFactory<Andar>('idProjetoEdificioPavimento');
  trackByEdificio = trackByFactory<Edificio>('idProjetoEdificioPavimento');
  trackBySite = trackByFactory<Site>('idProjetoEdificioPavimento');
}
