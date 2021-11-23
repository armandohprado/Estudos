import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GerenciadorGruposRoutingModule } from './gerenciador-grupos-routing.module';
import { GerenciadorGruposComponent } from './gerenciador-grupos.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { CenariosCabecalhoGgComponent } from './cenarios-cabecalho-gg/cenarios-cabecalho-gg.component';
import { FamiliaCorpoGerenciadorGruposComponent } from './familia-corpo-gerenciador-grupos/familia-corpo-gerenciador-grupos.component';
import { GrupoCorpoGerenciadorGruposComponent } from './familia-corpo-gerenciador-grupos/grupo-corpo-gerenciador-grupos/grupo-corpo-gerenciador-grupos.component';
import { AdicionarGrupoOpcionalComponent } from './adicionar-grupo-opcional/adicionar-grupo-opcional.component';
import { PlanilhaVendasHibridaSharedModule } from '../planilha-vendas-hibrida/shared/planilha-vendas-hibrida-shared.module';

@NgModule({
  declarations: [
    GerenciadorGruposComponent,
    CenariosCabecalhoGgComponent,
    FamiliaCorpoGerenciadorGruposComponent,
    GrupoCorpoGerenciadorGruposComponent,
    AdicionarGrupoOpcionalComponent,
  ],
  imports: [
    CommonModule,
    GerenciadorGruposRoutingModule,
    SharedModule,
    AwComponentsModule,
    PlanilhaVendasHibridaSharedModule,
  ],
})
export class GerenciadorGruposModule {}
