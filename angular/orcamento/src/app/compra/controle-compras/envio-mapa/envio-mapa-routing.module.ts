import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CnPropostaFornecedoresResolver } from '../resolver/cn-proposta-fornecedores.resolver';
import { CnGruposTransferenciaResolver } from '../resolver/cn-grupos-transferencia.resolver';
import { EnvioMapaComponent } from './envio-mapa.component';
import { EmpresasFaturamentoResolver } from '../emitir-cc/resolver/empresas-faturamento.resolver';
import { CnClassificacoesResolver } from './cn-classificacoes.resolver';
import { CnPlanoCompraQuestoesResolver } from '../resolver/cn-plano-compra-questoes.resolver';

const routes: Routes = [
  {
    path: '',
    resolve: [
      CnPropostaFornecedoresResolver,
      CnGruposTransferenciaResolver,
      EmpresasFaturamentoResolver,
      CnClassificacoesResolver,
      CnPlanoCompraQuestoesResolver,
    ],
    component: EnvioMapaComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnvioMapaRoutingModule {}
