import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodigoResgateComponent } from './codigo-resgate/codigo-resgate.component';
import { EnvioCodigoGuard } from './codigo-resgate/envio-codigo.guard';
import { RedirectComponent } from './codigo-resgate/redirect/redirect.component';
import { NovidadeComponent } from './novidades/novidade.component';
import { NovidadeResolver } from './novidades/novidade.resolver';

const routes: Routes = [
  {
    path: ``,
    pathMatch: 'full',
    component: CodigoResgateComponent,
  },
  {
    path: `codigo-resgate/:idCodigoResgate`,
    canActivate: [EnvioCodigoGuard],
    component: RedirectComponent,
  },
  {
    path: `novidades`,
    component: NovidadeComponent,
    resolve: [NovidadeResolver],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
