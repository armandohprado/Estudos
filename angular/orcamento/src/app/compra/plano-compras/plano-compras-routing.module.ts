import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanoComprasComponent } from './plano-compras.component';
import { PcColunasComponent } from './pc-colunas/pc-colunas.component';
import { PcColunasGuard } from './pc-colunas/pc-colunas.guard';
import { PcFaturamentosResolver } from './pc-faturamentos.resolver';
import { PcCabecalhoResolver } from './pc-cabecalho.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { PcListaResolver } from './pc-lista.resolver';

const routes: Routes = [
  {
    path: '',
    data: {
      [RouteDataEnum.breadcrumbs]: 'Plano de compras',
    },
    children: [
      {
        path: '',
        component: PlanoComprasComponent,
        resolve: [PcListaResolver, PcFaturamentosResolver, PcCabecalhoResolver],
        pathMatch: 'full',
      },
      {
        path: 'colunas',
        component: PcColunasComponent,
        canActivate: [PcColunasGuard],
        data: {
          [RouteDataEnum.hideBreadcrumbs]: true,
        },
      },
      {
        path: `fornecedores`,
        loadChildren: () => import('./pc-fornecedores/pc-fornecedores.module').then(m => m.PcFornecedoresModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanoComprasRoutingModule {}
