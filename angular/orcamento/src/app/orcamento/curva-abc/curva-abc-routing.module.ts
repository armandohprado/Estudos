import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CurvaABCComponent } from './curva-abc.component';
import { OrcamentoResolver } from '@aw-services/orcamento/orcamento.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';

const routes: Routes = [
  {
    path: '',
    data: {
      [RouteDataEnum.breadcrumbs]: 'Curva ABC',
    },
    children: [
      {
        path: '',
        component: CurvaABCComponent,
        resolve: [OrcamentoResolver],
      },
      {
        path: 'equalizacao-proposta',
        loadChildren: () =>
          import('../equalizacao-proposta/equalizacao-proposta.module').then(m => m.EqualizacaoPropostaModule),
      },
      {
        path: 'proposta',
        loadChildren: () =>
          import('../../fornecedor/devolucao-proposta/devolucao-proposta.module').then(m => m.DevolucaoPropostaModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurvaABCRoutingModule {}
