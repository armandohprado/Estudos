import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { EmitirCcComponent } from './emitir-cc.component';
import { EmitirCcResolver } from './resolver/emitir-cc.resolver';
import { EmitirCcContatosFornecedorResolver } from './resolver/emitir-cc-contatos-fornecedor.resolver';
import { EmpresasFaturamentoResolver } from './resolver/empresas-faturamento.resolver';
import { EmitirCcFornecedorInvalidoGuard } from './emitir-cc-fornecedor-invalido.guard';
import { EmitirCcSemMapaResolver } from './resolver/emitir-cc-sem-mapa.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { EmitirCcTipoEnum } from './emitir-cc-tipo.enum';
import { EmitirCcMiscellaneousResolver } from './resolver/emitir-cc-miscellaneous.resolver';
import { EmitirCcGrupoTaxaResolver } from './resolver/emitir-cc-grupo-taxa.resolver';
import { CnPlanoCompraQuestoesResolver } from '../resolver/cn-plano-compra-questoes.resolver';
import { EmitirCcRevendaResolver } from './resolver/emitir-cc-revenda.resolver';
import { EmpresasFaturamentoRevendaResolver } from './resolver/empresas-faturamento-revenda.resolver';

const routes: Routes = [
  {
    path: `fornecedor/:${RouteParamEnum.idFornecedor}`,
    resolve: [EmitirCcContatosFornecedorResolver, CnPlanoCompraQuestoesResolver],
    children: [
      {
        path: 'revenda',
        component: EmitirCcComponent,
        resolve: [EmitirCcRevendaResolver, EmpresasFaturamentoRevendaResolver],
        data: {
          [RouteDataEnum.tipo]: EmitirCcTipoEnum.Revenda,
        },
      },
      {
        path: 'miscellaneous',
        component: EmitirCcComponent,
        resolve: [EmitirCcMiscellaneousResolver, EmpresasFaturamentoResolver],
        data: {
          [RouteDataEnum.tipo]: EmitirCcTipoEnum.Miscellaneous,
        },
      },
      {
        path: 'grupo-taxa',
        component: EmitirCcComponent,
        resolve: [EmitirCcGrupoTaxaResolver, EmpresasFaturamentoResolver],
        data: {
          [RouteDataEnum.tipo]: EmitirCcTipoEnum.GrupoTaxa,
        },
      },
      {
        path: 'sem-mapa',
        component: EmitirCcComponent,
        resolve: [EmitirCcSemMapaResolver, EmpresasFaturamentoResolver],
        data: {
          [RouteDataEnum.tipo]: EmitirCcTipoEnum.SemMapa,
        },
      },
      {
        path: `:${RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor}`,
        component: EmitirCcComponent,
        resolve: [EmitirCcResolver, EmpresasFaturamentoResolver],
        canActivate: [EmitirCcFornecedorInvalidoGuard],
        data: {
          [RouteDataEnum.tipo]: EmitirCcTipoEnum.Padrao,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmitirCcRoutingModule {}
