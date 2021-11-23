import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { VisualizarMapaResolver } from './visualizar-mapa.resolver';
import { VisualizarMapaCnComponent } from './visualizar-mapa-cn.component';

const routes: Routes = [
  {
    path: `:${RouteParamEnum.idCompraNegociacaoGrupoMapa}`,
    resolve: [VisualizarMapaResolver],
    component: VisualizarMapaCnComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CnVisualizarMapaRoutingModule {}
