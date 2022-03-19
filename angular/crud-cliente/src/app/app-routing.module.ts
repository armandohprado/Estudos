import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsModule } from './pages/clients/clients.module';

const routes: Routes = [
  {
    path: 'clientes',
    loadChildren: () => ClientsModule,
  },
  {
    path:'',
    redirectTo:'clientes',
    pathMatch:'full',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
