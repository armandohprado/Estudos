import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguracaoComponent } from './configuracao.component';
import { ProjetoResolverIncludeExisteCompras } from '../../services/orcamento/projeto.resolver';

const routes: Routes = [
  {
    path: '',
    component: ConfiguracaoComponent,
    pathMatch: 'full',
    resolve: {
      projeto: ProjetoResolverIncludeExisteCompras,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracaoRoutingModule {}
