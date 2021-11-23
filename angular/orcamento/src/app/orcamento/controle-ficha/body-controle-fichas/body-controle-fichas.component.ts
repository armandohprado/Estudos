import { Component, Input } from '@angular/core';
import { FichaService } from '../service/ficha.service';
import { ControleFicha, ControleFichaTipo } from '../models/fichas';
import { AwFilterPipeProperties } from '@aw-components/aw-filter/aw-filter.pipe';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-body-controle-fichas',
  templateUrl: './body-controle-fichas.component.html',
  styleUrls: ['./body-controle-fichas.component.scss'],
})
export class BodyControleFichasComponent {
  constructor(public fichaService: FichaService) {}

  @Input() filters: AwFilterPipeProperties<ControleFicha> = {};

  trackByFicha = trackByFactory<ControleFicha>('idCompraNegociacaoGrupoFicha');
  trackByTipo = trackByFactory<ControleFichaTipo>('idCompraNegociacaoGrupoFichaTipo');
}
