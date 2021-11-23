import { Component } from '@angular/core';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-devolucao-proposta-tabs',
  templateUrl: './devolucao-proposta-tabs.component.html',
  styleUrls: ['./devolucao-proposta-tabs.component.scss'],
})
export class DevolucaoPropostaTabsComponent {
  constructor(
    public devolucaoPropostaService: DevolucaoPropostaService,
    private routerQuery: RouterQuery,
    private activatedRoute: ActivatedRoute
  ) {}

  activeTab = 0;
  supply = !!this.activatedRoute.snapshot.data[RouteParamEnum.supply];
  interno = !!this.activatedRoute.snapshot.data[RouteParamEnum.interno];

  selecionarAba(index: number): void {
    this.devolucaoPropostaService.loaderSteps = true;
    this.activeTab = +index;
  }
}
