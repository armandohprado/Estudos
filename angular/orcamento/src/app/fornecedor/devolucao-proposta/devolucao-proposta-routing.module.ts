import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevolucaoPropostaComponent } from './devolucao-proposta.component';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { DevolucaoPropostaGuard } from '@aw-services/devolucao-proposta/devolucao-proposta.guard';
import { DevolucaoPropostaTabsComponent } from './devolucao-proposta-tabs/devolucao-proposta-tabs.component';
import { UnidadeMedidaResolver } from '@aw-services/unidade-medida/unidade-medida.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { SubFornecedoresResolver } from '@aw-services/devolucao-proposta/sub-fornecedores.resolver';
import { DevolucaoPropostaResolver } from '@aw-services/devolucao-proposta/devolucao-proposta.resolver';

const routes: Routes = [
  {
    path: `:${RouteParamEnum.idDevolucaoProposta}`,
    children: [
      {
        path: '',
        canDeactivate: [DevolucaoPropostaGuard],
        component: DevolucaoPropostaComponent,
        resolve: {
          unidadeMedida: UnidadeMedidaResolver,
          subfornecedores: SubFornecedoresResolver,
        },
        children: [
          {
            path: 'interno',
            data: {
              [RouteParamEnum.interno]: true,
              [RouteDataEnum.breadcrumbs]: 'Devolução proposta',
            },
            children: [
              { path: '', component: DevolucaoPropostaTabsComponent, resolve: { proposta: DevolucaoPropostaResolver } },
              {
                path: 'pavimento',
                loadChildren: () =>
                  import('./excel-definir-valores/excel-definir-valores.module').then(m => m.ExcelDefinirValoresModule),
                data: {
                  [RouteDataEnum.breadcrumbs]: 'Definir valores',
                },
                resolve: { proposta: DevolucaoPropostaResolver },
              },
            ],
          },
          {
            path: `supply/:${RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor}`,
            data: {
              [RouteParamEnum.supply]: true,
              [RouteDataEnum.hideBreadcrumbs]: true,
            },
            children: [
              { path: '', component: DevolucaoPropostaTabsComponent, resolve: { proposta: DevolucaoPropostaResolver } },
              {
                path: 'pavimento',
                loadChildren: () =>
                  import('./excel-definir-valores/excel-definir-valores.module').then(m => m.ExcelDefinirValoresModule),
                resolve: {
                  unidadeMedida: UnidadeMedidaResolver,
                  proposta: DevolucaoPropostaResolver,
                },
              },
            ],
          },
        ],
      },
      {
        path: 'tutorial',
        loadChildren: () =>
          import('../tutorial-portal-fornecedor/tutorial-portal-fornecedor.module').then(
            m => m.TutorialPortalFornecedorModule
          ),
        resolve: {
          proposta: DevolucaoPropostaResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DevolucaoPropostaRoutingModule {}
