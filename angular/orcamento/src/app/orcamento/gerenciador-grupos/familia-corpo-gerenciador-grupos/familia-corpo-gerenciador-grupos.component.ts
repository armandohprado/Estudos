import { Component, Input, OnInit } from '@angular/core';
import { FamiliaGG, GrupoGG } from '../state/gerenciador-grupo.model';
import { trackByFactory } from '@aw-utils/track-by';
import { collapseAnimation } from '@aw-shared/animations/collapse';

@Component({
  selector: 'app-familia-corpo-gerenciador-grupos',
  templateUrl: './familia-corpo-gerenciador-grupos.component.html',
  styleUrls: ['../gerenciador-grupos.component.scss', './familia-corpo-gerenciador-grupos.component.scss'],
  animations: [collapseAnimation()],
})
export class FamiliaCorpoGerenciadorGruposComponent implements OnInit {
  constructor() {}
  trackByGrupo = trackByFactory<GrupoGG>('idOrcamentoGrupo');
  @Input() familia: FamiliaGG;
  ngOnInit(): void {}
}
