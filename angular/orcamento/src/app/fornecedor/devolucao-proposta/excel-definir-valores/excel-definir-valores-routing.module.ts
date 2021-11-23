import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExcelDefinirValoresComponent } from './excel-definir-valores.component';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { SalvarFilaGuard } from './salvar-fila.guard';
import { SubFornecedoresResolver } from './sub-fornecedores.resolver';
import { ListaPropostaResolver } from './lista-proposta.resolver';
import { InformacaoPropostaResolver } from './informacao-proposta.resolver';
import { SpreadjsKeyGuard } from '@aw-services/chave-registro/spreadjs-key.guard';

const routes: Routes = [
  {
    path: `:${RouteParamEnum.idPavimento}`,
    component: ExcelDefinirValoresComponent,
    canActivate: [SpreadjsKeyGuard],
    canDeactivate: [SalvarFilaGuard],
    resolve: {
      subFornecedores: SubFornecedoresResolver,
      listaProposta: ListaPropostaResolver,
      informacaoProposta: InformacaoPropostaResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExcelDefinirValoresRoutingModule {}
