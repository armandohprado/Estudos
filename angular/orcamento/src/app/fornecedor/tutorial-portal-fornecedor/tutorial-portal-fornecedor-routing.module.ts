import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TutorialPortalFornecedorComponent } from './tutorial-portal-fornecedor.component';
import { RouteDataEnum } from '@aw-models/route-data.enum';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: TutorialPortalFornecedorComponent,
    data: {
      [RouteDataEnum.hideBreadcrumbs]: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TutorialPortalFornecedorRoutingModule {}
