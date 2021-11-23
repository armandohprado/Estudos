import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteParamEnum } from './models/route-param.enum';
import { ProjetoAltResolver } from '@aw-services/orcamento/projeto.resolver';

const routes: Routes = [
  {
    path: `projetos/:${RouteParamEnum.idProjeto}/orcamentos`,
    loadChildren: () => import('./orcamento/orcamento.module').then(m => m.OrcamentoModule),
    resolve: [ProjetoAltResolver],
  },
  {
    path: 'devolucao-proposta',
    loadChildren: () => import('./fornecedor/fornecedor.module').then(m => m.FornecedorModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      relativeLinkResolution: 'corrected', // correção do bug das rotas relativas: https://github.com/angular/angular/issues/22792
      initialNavigation: 'enabled',
      paramsInheritanceStrategy: 'always',
      enableTracing: false,
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
