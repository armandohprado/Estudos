import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CenariosComponent } from './cenarios.component';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { CenariosPadraoResolver } from '@aw-services/orcamento/cenarios.resolver';
import { PlanilhaCongeladaGuard } from '../planilha-vendas-hibrida/planilha-congelada.guard';
import { RouteParamEnum } from '@aw-models/route-param.enum';

const routes: Routes = [
  {
    path: '',
    data: {
      [RouteDataEnum.breadcrumbs]: 'Cenários',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CenariosComponent,
        resolve: {
          cenarios: CenariosPadraoResolver,
        },
      },
      {
        path: 'gerenciador-grupos',
        loadChildren: () =>
          import('../gerenciador-grupos/gerenciador-grupos.module').then(m => m.GerenciadorGruposModule),
      },
      {
        path: `:${RouteParamEnum.idOrcamentoCenario}`,
        children: [
          {
            path: 'planilha-vendas-hibrida',
            loadChildren: () =>
              import('../planilha-vendas-hibrida/planilha-vendas-hibrida.module').then(
                m => m.PlanilhaVendasHibridaModule
              ),
            canActivate: [PlanilhaCongeladaGuard],
          },
          {
            path: 'cadernos',
            loadChildren: () => import('./cadernos/cadernos.module').then(m => m.CadernosModule),
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CenariosRoutingModule {}
