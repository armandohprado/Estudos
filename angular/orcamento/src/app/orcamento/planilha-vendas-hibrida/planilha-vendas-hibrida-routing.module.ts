import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanilhaVendasHibridaComponent } from './planilha-vendas-hibrida.component';
import { PlanilhaHibridaCenarioResolver } from './planilha-vendas.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';

const routes: Routes = [
  {
    path: '',
    data: {
      [RouteDataEnum.breadcrumbs]: 'Planilha de Vendas Híbrida',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PlanilhaVendasHibridaComponent,
        resolve: {
          phCenario: PlanilhaHibridaCenarioResolver,
        },
      },
      {
        path: 'proposta',
        loadChildren: () =>
          import('../../fornecedor/devolucao-proposta/devolucao-proposta.module').then(m => m.DevolucaoPropostaModule),
      },
      {
        path: 'equalizacao-proposta',
        loadChildren: () =>
          import('../equalizacao-proposta/equalizacao-proposta.module').then(m => m.EqualizacaoPropostaModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanilhaVendasHibridaRoutingModule {}
