import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadernosComponent } from './cadernos.component';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { CadernosResolver } from './cadernos.resolver';

const routes: Routes = [
  {
    path: '',
    data: {
      [RouteDataEnum.breadcrumbs]: 'Cadernos',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CadernosComponent,
        resolve: [CadernosResolver],
      },
      {
        path: `:${RouteParamEnum.idCaderno}`,
        loadChildren: () => import('./caderno/caderno.module').then(m => m.CadernoModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadernosRoutingModule {}
