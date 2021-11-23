import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangeOrderComponent } from './change-order.component';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { CriarChangeOrderComponent } from './criar-change-order/criar-change-order.component';
import { ChangeOrderFamiliasResolver } from './criar-change-order/change-order-familias.resolver';
import { FamiliaChangeOrderComponent } from './criar-change-order/familias-change-order/familia-change-order/familia-change-order.component';
import { ChangeOrderResolver } from './change-order.resolver';
import { RfiResolver } from '@aw-services/projeto/rfi.resolver';
import { PlanilhaCongeladaGuard } from '../orcamento/planilha-vendas-hibrida/planilha-congelada.guard';
import { ChangeOrderHeaderResolver } from './change-order-header.resolver';

const routes: Routes = [
  {
    path: '',
    data: {
      [RouteDataEnum.breadcrumbs]: 'Change order',
    },
    resolve: [ChangeOrderResolver, ChangeOrderHeaderResolver],
    children: [
      {
        path: '',
        component: ChangeOrderComponent,
      },
      {
        path: `criar`,
        component: CriarChangeOrderComponent,
        resolve: [ChangeOrderFamiliasResolver, RfiResolver],
        data: {
          [RouteDataEnum.hideBreadcrumbs]: true,
        },
        children: [
          {
            path: `familia/:${RouteParamEnum.idFamilia}`,
            component: FamiliaChangeOrderComponent,
          },
        ],
      },
      {
        path: `:${RouteParamEnum.idOrcamentoCenario}`,
        children: [
          {
            path: 'planilha-vendas-hibrida',
            loadChildren: () =>
              import('../orcamento/planilha-vendas-hibrida/planilha-vendas-hibrida.module').then(
                m => m.PlanilhaVendasHibridaModule
              ),
            canActivate: [PlanilhaCongeladaGuard],
          },
          {
            path: 'cotacao',
            loadChildren: () => import('../orcamento/cotacao/cotacao.module').then(m => m.CotacaoModule),
            data: {
              [RouteDataEnum.propostaShowLinkLoginTemporario]: true,
            },
          },
          {
            path: 'controle-compra',
            loadChildren: () =>
              import('../compra/controle-compras/controle-compras.module').then(m => m.ControleComprasModule),
          },
        ],
      },
      {
        path: `editar/:${RouteParamEnum.idOrcamentoChangeOrder}`,
        data: {
          [RouteDataEnum.hideBreadcrumbs]: true,
        },
        children: [
          {
            path: '',
            component: CriarChangeOrderComponent,
            resolve: [ChangeOrderFamiliasResolver, RfiResolver],
            children: [
              {
                path: `familia/:${RouteParamEnum.idFamilia}`,
                component: FamiliaChangeOrderComponent,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeOrderRoutingModule {}
