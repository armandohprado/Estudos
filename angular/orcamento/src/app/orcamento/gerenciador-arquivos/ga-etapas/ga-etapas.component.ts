import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { GaEtapaQuery } from '../state/etapa/ga-etapa.query';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { AwRouterQuery } from '../../../services/core/router.query';
import { RouteParamEnum } from '../../../models/route-param.enum';
import { GaEtapa } from '../model/etapa';
import { trackByFactory } from '../../../utils/track-by';

@Component({
  selector: 'app-ga-etapas',
  templateUrl: './ga-etapas.component.html',
  styleUrls: ['./ga-etapas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaEtapasComponent implements OnInit, AfterViewInit {
  constructor(
    private routerQuery: AwRouterQuery,
    public gaEtapaQuery: GaEtapaQuery,
    private gerenciadorArquivosService: GerenciadorArquivosService
  ) {}

  @ViewChild('tabset') tabset: TabsetComponent;

  trackByEtapa = trackByFactory<GaEtapa>('id');

  setEtapaSelected(etapa: GaEtapa): void {
    this.gerenciadorArquivosService.setEtapaSelected(etapa);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      const idEtapa = this.routerQuery.getQueryParams(RouteParamEnum.idEtapa);
      if (idEtapa) {
        this.tabset.tabs = this.tabset.tabs.map(tab => {
          tab.active = idEtapa === tab.id;
          return tab;
        });
      }
    });
  }
}
