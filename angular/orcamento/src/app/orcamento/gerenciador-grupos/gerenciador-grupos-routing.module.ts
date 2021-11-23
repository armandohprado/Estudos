import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GerenciadorGruposComponent } from './gerenciador-grupos.component';
import { GerenciadorGruposResolver } from './services/gerenciador-grupos.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';

const routes: Routes = [
  {
    path: '',
    component: GerenciadorGruposComponent,
    resolve: [GerenciadorGruposResolver],
    data: {
      [RouteDataEnum.breadcrumbs]: 'Gerenciador de Grupos',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerenciadorGruposRoutingModule {}
