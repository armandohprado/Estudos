import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutsComponent } from './layouts/layouts.component';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { FormsModule } from '@angular/forms';
import { CondicaoGeralItemExclusaoComponent } from './condicao-geral-item-exclusao/condicao-geral-item-exclusao.component';
import { SharedModule } from '@aw-shared/shared.module';
import { CadernoComponent } from './caderno.component';
import { PlanilhaComponent } from './planilha/planilha.component';
import { CadernoRoutingModule } from './caderno-routing.module';
import { CadernoCardComponent } from './caderno-card/caderno-card.component';
import { OrcamentoFiltroComponent } from './orcamento-filtro/orcamento-filtro.component';
import { OrcamentoFiltroColunasComponent } from './orcamento-filtro/orcamento-filtro-colunas/orcamento-filtro-colunas.component';
import { OrcamentoFiltroNiveisComponent } from './orcamento-filtro/orcamento-filtro-niveis/orcamento-filtro-niveis.component';
import { OrcamentoFiltroPavimentoComponent } from './orcamento-filtro/orcamento-filtro-pavimento/orcamento-filtro-pavimento.component';

@NgModule({
  imports: [CommonModule, CadernoRoutingModule, SharedModule, AwComponentsModule, FormsModule],
  declarations: [
    CadernoComponent,
    LayoutsComponent,
    CondicaoGeralItemExclusaoComponent,
    PlanilhaComponent,
    CadernoCardComponent,
    OrcamentoFiltroComponent,
    OrcamentoFiltroColunasComponent,
    OrcamentoFiltroNiveisComponent,
    OrcamentoFiltroPavimentoComponent,
  ],
})
export class CadernoModule {}
