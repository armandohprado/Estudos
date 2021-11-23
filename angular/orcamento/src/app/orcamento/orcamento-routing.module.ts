import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { RouteParamEnum } from '../models/route-param.enum';
import { RouteDataEnum } from '../models/route-data.enum';
import { Breadcrumb } from '../breadcrumbs/breadcrumb';
import { BreadcrumbsResolver } from '../breadcrumbs/breadcrumbs.resolver';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Injectable({ providedIn: 'root' })
export class OrcamentosBreadcrumbsResolver extends BreadcrumbsResolver {
  constructor(private projetoService: ProjetoService) {
    super();
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Breadcrumb[]> {
    const idProjeto = +route.paramMap.get(RouteParamEnum.idProjeto);
    return this.projetoService.get(idProjeto).pipe(
      map(projeto => [
        {
          text: `${projeto.numeroProjeto} ${projeto.nomeProjeto}`,
          path: `/projetos/${idProjeto}/orcamentos`,
        },
      ])
    );
  }
}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./configuracao/configuracao.module').then(m => m.ConfiguracaoModule),
    data: {
      [RouteDataEnum.breadcrumbs]: OrcamentosBreadcrumbsResolver,
    },
  },
  {
    path: 'configuracoes',
    redirectTo: '',
  },
  {
    path: `:${RouteParamEnum.idOrcamento}/cenarios/:${RouteParamEnum.idOrcamentoCenario}`,
    data: {
      [RouteDataEnum.breadcrumbs]: OrcamentosBreadcrumbsResolver,
    },
    children: [
      {
        path: 'plano-de-orcamento',
        loadChildren: () => import('./plano-de-orcamento/plano-orcamento.module').then(m => m.PlanoOrcamentoModule),
        data: {
          [RouteDataEnum.breadcrumbs]: 'Plano de orçamento',
        },
      },
      {
        path: 'cotacao',
        loadChildren: () => import('./cotacao/cotacao.module').then(m => m.CotacaoModule),
      },
      {
        path: 'compras',
        children: [
          {
            path: 'controle-compra',
            loadChildren: () =>
              import('../compra/controle-compras/controle-compras.module').then(m => m.ControleComprasModule),
          },
          {
            path: 'plano-compras',
            loadChildren: () => import('../compra/plano-compras/plano-compras.module').then(m => m.PlanoComprasModule),
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
export class OrcamentoRoutingModule {}
