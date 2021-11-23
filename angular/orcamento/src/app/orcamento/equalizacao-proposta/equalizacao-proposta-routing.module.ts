import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { EqualizacaoPropostaComponent } from './equalizacao-proposta.component';
import { EqualizacaoPropostaResolver } from './equalizacao-proposta.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';

const routes: Routes = [
  {
    path: `:${RouteParamEnum.idOrcamentoGrupo}`,
    component: EqualizacaoPropostaComponent,
    resolve: [EqualizacaoPropostaResolver],
    data: {
      [RouteDataEnum.breadcrumbs]: 'Equalização de propostas',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EqualizacaoPropostaRoutingModule {}
