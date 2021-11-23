import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanoOrcamentoComponent } from './plano-orcamento.component';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { PlanoOrcamentoRoutingModule } from './plano-orcamento-routing.module';
import { SharedModule } from '@aw-shared/shared.module';
import { StepsPlanoOrcamentoComponent } from './steps-plano-orcamento/steps-plano-orcamento.component';
import { ModalSelecionarGruposComponent } from './tabs-steps/tab-grupos/familia/modal-selecionar-grupos/modal-selecionar-grupos.component';
import { TabFornecedoresComponent } from './tabs-steps/tab-fornecedores/tab-fornecedores.component';
import { SearchGrupaoGrupoPipe } from './tabs-steps/tab-grupos/familia/modal-selecionar-grupos/search-grupao-grupo.pipe';
import { GrupoComponent } from './tabs-steps/tab-grupos/familia/grupo/grupo.component';
import { ModalFornecedoresComponent } from './tabs-steps/tab-fornecedores/modal-fornecedores/modal-fornecedores.component';
import { TabGruposComponent } from './tabs-steps/tab-grupos/tab-grupos.component';
import { GrupaoComponent } from './tabs-steps/tab-grupos/familia/grupao/grupao.component';
import { ModalNovaFamiliaComponent } from './tabs-steps/tab-grupos/modal-nova-familia/modal-nova-familia.component';
import { ListaResponsaveisComponent } from './tabs-steps/tab-responsaveis/lista-responsaveis/lista-responsaveis.component';
import { FamiliaComponent } from './tabs-steps/tab-grupos/familia/familia.component';
import { TabResponsaveisComponent } from './tabs-steps/tab-responsaveis/tab-responsaveis.component';
import { DataLimiteDefinicaoValidatorDirective } from './tabs-steps/tab-responsaveis/data-limite-definicao-validator.directive';
import { TabDatasComponent } from './tabs-steps/tab-datas/tab-datas.component';
import { TabAnotacoesComponent } from './tabs-steps/tab-anotacoes/tab-anotacoes.component';
import { NgxMaskModule } from 'ngx-mask';
import { GrupoPropostaModule } from '../../grupo/grupo-proposta.module';
import { ModoExibicaoComponent } from './modo-exibicao/modo-exibicao.component';

const declarations = [
  PlanoOrcamentoComponent,
  TabDatasComponent,
  ModalNovaFamiliaComponent,
  ListaResponsaveisComponent,
  TabGruposComponent,
  TabResponsaveisComponent,
  TabAnotacoesComponent,
  TabFornecedoresComponent,
  ModalFornecedoresComponent,
  FamiliaComponent,
  GrupaoComponent,
  GrupoComponent,
  ModalSelecionarGruposComponent,
  DataLimiteDefinicaoValidatorDirective,
  SearchGrupaoGrupoPipe,
  StepsPlanoOrcamentoComponent,
];

@NgModule({
  declarations: [...declarations, ModoExibicaoComponent],
  exports: [...declarations],
  imports: [
    CommonModule,
    PlanoOrcamentoRoutingModule,
    AwComponentsModule,
    SharedModule,
    GrupoPropostaModule,
    NgxMaskModule,
  ],
})
export class PlanoOrcamentoModule {}
