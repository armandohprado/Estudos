import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CliFuncaoGuard } from './cli-funcao.guard';
import { SpreadjsKeyGuard } from '../core/chave-registro/spreadjs-key.guard';
import { CheckListIntegradoComponent } from './check-list-integrado.component';

const routes: Routes = [
  {
    path: `:${RouteParamEnum.idProjetoCheckListIntegrado}`,
    component: CheckListIntegradoComponent,
    canActivate: [CliFuncaoGuard, SpreadjsKeyGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckListIntegradoRoutingModule {}
