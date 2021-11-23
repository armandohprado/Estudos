import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';

const routes: Routes = [
  {
    path: `projeto/:${RouteParamEnum.idProjeto}/checklist`,
    loadChildren: () =>
      import('./checklist-integrado/check-list-integrado.module').then(m => m.CheckListIntegradoModule),
  },
  {
    path: 'descongelar-cronograma',
    loadChildren: () =>
      import('./descongelar-cronogramas/descongelar-cronogramas.module').then(m => m.DescongelarCronogramasModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
