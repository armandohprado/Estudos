import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CotacaoAdicionarFornecedorComponent } from './cotacao-adicionar-fornecedor.component';
import { CnFichaCausaResolver } from '../../../compra/controle-compras/resolver/cn-ficha-causa.resolver';
import { CnFichaAreaResolver } from '../../../compra/controle-compras/resolver/cn-ficha-area.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { GrupoAltResolver } from '@aw-services/orcamento-alt/grupo-alt.resolver';

const routes: Routes = [
  {
    path: `:${RouteParamEnum.idOrcamentoGrupo}`,
    component: CotacaoAdicionarFornecedorComponent,
    resolve: {
      CnFichaCausaResolver,
      CnFichaAreaResolver,
      [RouteDataEnum.grupoAlt]: GrupoAltResolver,
    },
    data: {
      [RouteDataEnum.hideBreadcrumbs]: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CotacaoAdicionarFornecedorRoutingModule {}
