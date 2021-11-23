import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LousaComponent } from './lousa.component';
import { LousaResolver } from './lousa.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';

const routes: Routes = [
  {
    path: '',
    component: LousaComponent,
    resolve: [LousaResolver],
    data: {
      [RouteDataEnum.breadcrumbs]: 'Lousa',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LousaRoutingModule {}
