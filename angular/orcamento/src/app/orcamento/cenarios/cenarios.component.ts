import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { Cenario, CenarioStatusEnum } from '../../models';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalCenarioComponent } from './modal-cenario.component';
import { map } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

interface CenarioGroup {
  idStatus: number;
  nome: string;
  class: string;
  cenarios: Cenario[];
}

@Component({
  selector: 'app-cenarios',
  templateUrl: './cenarios.component.html',
  styleUrls: ['./cenarios.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CenariosComponent implements OnInit {
  constructor(
    private cenariosService: CenariosService,
    private activatedRoute: ActivatedRoute,
    private bsModalService: BsModalService,
    private projetoService: ProjetoService
  ) {}

  projeto$ = this.projetoService.projeto$;
  cenarioPadrao$ = this.cenariosService.cenarioPadrao$;
  cenariosGrouped$ = this.cenariosService.cenarios$.pipe(
    map<Cenario[], CenarioGroup[]>(cenarios => {
      return [
        { idStatus: CenarioStatusEnum.propostaAprovada, nome: 'Aprovada pelo Cliente', class: 'success', cenarios: [] },
        { idStatus: CenarioStatusEnum.analiseCliente, nome: 'Em análise pelo Cliente', class: 'orange', cenarios: [] },
        { idStatus: CenarioStatusEnum.aprovadoCEO, nome: 'Aprovada pelo CEO', class: 'orange', cenarios: [] },
        { idStatus: CenarioStatusEnum.analiseCEO, nome: 'Em análise pelo CEO', class: 'orange', cenarios: [] },
        { idStatus: CenarioStatusEnum.emEdicao, nome: 'Em edição', class: 'warning', cenarios: [] },
        { idStatus: CenarioStatusEnum.arquivados, nome: 'Arquivados', class: 'secondary', cenarios: [] },
        { idStatus: CenarioStatusEnum.congelado, nome: 'Congelados', class: 'secondary', cenarios: [] },
      ]
        .map(group => ({ ...group, cenarios: cenarios.filter(cenario => cenario.idCenarioStatus === group.idStatus) }))
        .filter(group => group.cenarios.length);
    })
  );
  idOrcamento = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);

  trackByCenario = trackByFactory<Cenario>('idOrcamentoCenario');
  trackByStatus = trackByFactory<CenarioGroup>('idStatus');

  ngOnInit(): void {}

  openModal(cenario: Cenario = null): void {
    this.bsModalService.show(ModalCenarioComponent, {
      class: 'modal-md modal-dialog-centered',
      backdrop: 'static',
      initialState: {
        idOrcamento: this.idOrcamento,
        cenario,
      },
    });
  }
}
