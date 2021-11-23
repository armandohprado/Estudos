import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CadernoComponent } from './caderno.component';
import { CadernoResolver } from '@aw-services/orcamento/caderno.resolver';
import { CadernoLayoutsResolver } from './caderno-layouts.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { PlanilhaComponent } from './planilha/planilha.component';
import { CenarioPadraoResolver } from '@aw-services/orcamento/cenario-padrao.resolver';

const routes: Routes = [
  {
    path: '',
    component: CadernoComponent,
    resolve: {
      caderno: CadernoResolver,
      layouts: CadernoLayoutsResolver,
      cenarioPadrao: CenarioPadraoResolver,
    },
    data: {
      [RouteDataEnum.breadcrumbs]: 'Configurar caderno',
    },
    children: [
      {
        path: `planilhas/:${RouteParamEnum.idPlanilha}`,
        component: PlanilhaComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadernoRoutingModule {}
