import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControleFichaComponent } from './controle-ficha.component';
import { ControleFichaResolver } from './controle-ficha.resolver';
import { RouteDataEnum } from '../../models/route-data.enum';

const routes: Routes = [
  {
    path: '',
    component: ControleFichaComponent,
    data: {
      [RouteDataEnum.hideBreadcrumbs]: true,
    },
    resolve: [ControleFichaResolver],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControleFichaRoutingModule {}
