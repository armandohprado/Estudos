import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteParamEnum } from '../../../models/route-param.enum';
import { PcFornecedoresComponent } from './pc-fornecedores.component';
import { PcColunasGuard } from '../pc-colunas/pc-colunas.guard';
import { RouteDataEnum } from '../../../models/route-data.enum';

const routes: Routes = [
  {
    path: `:${RouteParamEnum.idPlanoCompraGrupo}`,
    component: PcFornecedoresComponent,
    canActivate: [PcColunasGuard],
    data: {
      [RouteDataEnum.hideBreadcrumbs]: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PcFornecedoresRoutingModule {}
