import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjetoResolverWithCache } from '@aw-services/orcamento/projeto.resolver';
import { OrcamentoResolver } from '@aw-services/orcamento/orcamento.resolver';
import { PlanoOrcamentoComponent } from './plano-orcamento.component';
import { VisualizarGruposEmListaResolver } from '@aw-services/orcamento/visualizar-grupos-em-lista.resolver';

const routes: Routes = [
  {
    path: '',
    component: PlanoOrcamentoComponent,
    resolve: {
      projeto: ProjetoResolverWithCache,
      orcamento: OrcamentoResolver,
      flagVisualizacao: VisualizarGruposEmListaResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanoOrcamentoRoutingModule {}
