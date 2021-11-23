import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CotacaoComponent } from './cotacao.component';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { Breadcrumb } from '../../breadcrumbs/breadcrumb';
import { VisualizarGruposEmListaResolver } from '@aw-services/orcamento/visualizar-grupos-em-lista.resolver';
import { FamiliasAltPaginacaoResolver } from '@aw-services/orcamento-alt/familias-alt-paginacao.resolver';
import { CenarioPadraoResolver } from '@aw-services/orcamento/cenario-padrao.resolver';
import { FamiliasAltTotaisResolver } from '@aw-services/orcamento-alt/familias-alt-totais.resolver';
import { GruposAltSimplesResolver } from '@aw-services/orcamento-alt/grupos-alt-simples.resolver';
import { CenariosRelacionadosResolver } from '@aw-services/orcamento/cenarios-relacionados.resolver';

const routes: Routes = [
  {
    path: '',
    data: {
      [RouteDataEnum.breadcrumbs]: { text: 'Controle de cotação', queryParamsHandling: 'merge' } as Breadcrumb,
    },
    children: [
      {
        path: '',
        component: CotacaoComponent,
        resolve: {
          CenarioPadraoResolver,
          VisualizarGruposEmListaResolver,
          [RouteDataEnum.familiasPaginacao]: FamiliasAltPaginacaoResolver,
          [RouteDataEnum.familiasTotais]: FamiliasAltTotaisResolver,
          [RouteDataEnum.gruposCombo]: GruposAltSimplesResolver,
          [RouteDataEnum.cenariosRelacionados]: CenariosRelacionadosResolver,
        },
      },
      {
        path: 'gerenciador-arquivos',
        loadChildren: () =>
          import('../gerenciador-arquivos/gerenciador-arquivos.module').then(m => m.GerenciadorArquivosModule),
      },
      {
        path: 'curva-abc',
        loadChildren: () => import('../curva-abc/curva-abc.module').then(m => m.CurvaABCModule),
      },
      {
        path: 'lista-cenarios',
        loadChildren: () => import('../cenarios/cenarios.module').then(m => m.CenariosModule),
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
      {
        path: 'adicionar-fornecedor',
        loadChildren: () =>
          import('./cotacao-adicionar-fornecedor/cotacao-adicionar-fornecedor.module').then(
            m => m.CotacaoAdicionarFornecedorModule
          ),
      },
      {
        path: 'gerenciador-grupos',
        loadChildren: () =>
          import('../gerenciador-grupos/gerenciador-grupos.module').then(m => m.GerenciadorGruposModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CotacaoRoutingModule {}
