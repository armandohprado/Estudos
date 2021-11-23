import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CnAdicionarFornecedorComponent } from './cn-adicionar-fornecedor.component';
import { CnFichaCausaResolver } from '../resolver/cn-ficha-causa.resolver';
import { CnFichaAreaResolver } from '../resolver/cn-ficha-area.resolver';

const routes: Routes = [
  {
    path: '',
    component: CnAdicionarFornecedorComponent,
    resolve: [CnFichaCausaResolver, CnFichaAreaResolver],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CnAdicionarFornecedorRoutingModule {}
