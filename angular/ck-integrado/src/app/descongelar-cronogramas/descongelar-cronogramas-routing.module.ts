import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DescongelarCronogramasComponent } from './descongelar-cronogramas.component';

const routes: Routes = [
  {
    path: '',
    component: DescongelarCronogramasComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DescongelarCronogramasRoutingModule {}
