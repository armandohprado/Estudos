import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControleComprasComponent } from './controle-compras.component';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { EnderecosPaisesResolver } from '@aw-services/enderecos/enderecos.resolver';
import { CnCompraNegociacaoGrupoGuard } from './cn-compra-negociacao-grupo.guard';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { ResetStateGuard } from './reset-state.guard';
import { CnCabecalhoResolver } from './resolver/cn-cabecalho.resolver';
import { CnOrigemCompraResolver } from './resolver/cn-origem-compra.resolver';
import { Breadcrumb } from '../../breadcrumbs/breadcrumb';
import { CenariosPadraoResolver } from '@aw-services/orcamento/cenarios.resolver';

const routes: Routes = [
  {
    path: '',
    data: {
      [RouteDataEnum.breadcrumbs]: { text: 'Controle compras', queryParamsHandling: 'merge' } as Breadcrumb,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        resolve: [CnCabecalhoResolver, EnderecosPaisesResolver, CnOrigemCompraResolver,CenariosPadraoResolver],
        component: ControleComprasComponent,
        canActivate: [ResetStateGuard],
      },
      {
        path: 'change-order',
        loadChildren: () => import('../../change-order/change-order.module').then(m => m.ChangeOrderModule),
      },
      {
        path: 'lousa',
        loadChildren: () => import('../lousa/lousa.module').then(m => m.LousaModule),
      },
      {
        path: 'controle-fichas',
        loadChildren: () =>
          import('../../orcamento/controle-ficha/controle-ficha.module').then(m => m.ControleFichaModule),
      },
      {
        path: 'gerenciador-arquivos',
        loadChildren: () =>
          import('../../orcamento/gerenciador-arquivos/gerenciador-arquivos.module').then(
            m => m.GerenciadorArquivosModule
          ),
      },
      {
        path: 'plano-compras',
        loadChildren: () => import('../plano-compras/plano-compras.module').then(m => m.PlanoComprasModule),
      },
      {
        path: 'equalizacao-proposta',
        loadChildren: () =>
          import('../../orcamento/equalizacao-proposta/equalizacao-proposta.module').then(
            m => m.EqualizacaoPropostaModule
          ),
      },
      {
        path: 'proposta',
        loadChildren: () =>
          import('../../fornecedor/devolucao-proposta/devolucao-proposta.module').then(m => m.DevolucaoPropostaModule),
      },
      {
        path: `:${RouteParamEnum.idCompraNegociacaoGrupo}`,
        canActivate: [CnCompraNegociacaoGrupoGuard],
        data: {
          [RouteDataEnum.hideBreadcrumbs]: true,
        },
        children: [
          {
            path: 'envio-mapa',
            loadChildren: () => import('./envio-mapa/envio-mapa.module').then(m => m.EnvioMapaModule),
          },
          {
            path: 'emitir-cc',
            loadChildren: () => import('./emitir-cc/emitir-cc.module').then(m => m.EmitirCcModule),
          },
          {
            path: `adicionar-fornecedor`,
            loadChildren: () =>
              import('./cn-adicionar-fornecedor/cn-adicionar-fornecedor.module').then(
                m => m.CnAdicionarFornecedorModule
              ),
          },
          {
            path: `visualizar-mapa`,
            loadChildren: () =>
              import('./cn-visualizar-mapa/cn-visualizar-mapa.module').then(m => m.CnVisualizarMapaModule),
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
export class ControleComprasRoutingModule {}
