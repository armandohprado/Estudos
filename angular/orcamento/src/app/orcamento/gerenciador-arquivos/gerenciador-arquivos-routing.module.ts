import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { GerenciadorArquivosComponent } from './gerenciador-arquivos.component';
import { GaSelectOrcamentoGrupoComponent } from './ga-select-orcamento-grupo/ga-select-orcamento-grupo.component';
import { GaGruposOrcamentoResolver } from './resolver/ga-grupos-orcamento.resolver';
import { GaInicializarResolver } from './resolver/ga-inicializar.resolver';
import { GaAnexosAvulsosResolver } from './resolver/ga-anexos-avulsos.resolver';
import { GaPavimentosResolver } from './resolver/ga-pavimentos.resolver';
import { GaEtapasResolver } from './resolver/ga-etapas.resolver';
import { GaExtensoesResolver } from './resolver/ga-extensoes.resolver';
import { RouteDataEnum } from '@aw-models/route-data.enum';

const routes: Routes = [
  {
    path: '',
    component: GaSelectOrcamentoGrupoComponent,
    resolve: {
      gruposOrcamento: GaGruposOrcamentoResolver,
    },
    data: {
      [RouteDataEnum.breadcrumbs]: 'Gerenciador de arquivos',
    },
    children: [
      {
        path: `:${RouteParamEnum.idOrcamentoGrupo}`,
        component: GerenciadorArquivosComponent,
        resolve: [
          GaInicializarResolver,
          GaAnexosAvulsosResolver,
          GaPavimentosResolver,
          GaEtapasResolver,
          GaExtensoesResolver,
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerenciadorArquivosRoutingModule {}
