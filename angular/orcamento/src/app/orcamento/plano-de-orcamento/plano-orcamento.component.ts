import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Edificio } from '@aw-models/index';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { fadeInOutAnimation } from '@aw-shared/animations/fadeOut';
import { trackByFactory } from '@aw-utils/track-by';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Component({
  selector: 'app-plano-orcamento',
  templateUrl: './plano-orcamento.component.html',
  styleUrls: ['./plano-orcamento.component.scss'],
  animations: [fadeInOutAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanoOrcamentoComponent implements OnInit, OnDestroy {
  constructor(public orcamentoService: OrcamentoService, private projetoService: ProjetoService) {}

  orcamento$ = this.orcamentoService.orcamento$;
  projeto$ = this.projetoService.projeto$;
  bsConfig: Partial<BsDatepickerConfig> = {
    isAnimated: true,
    containerClass: 'theme-primary',
    dateInputFormat: 'DD/MM/YYYY [às] HH:mm',
  };

  trackByEdificio = trackByFactory<Edificio>('idEdificio');

  ngOnInit(): void {
    this.orcamentoService.setGrupoesMap(this.orcamentoService.familias$.value);
  }

  ngOnDestroy(): void {
    this.orcamentoService.clearGrupoesMap();
  }
}
