import { AwComponentsModule } from '@aw-components/aw-components.module';
import { AndarComponent } from './steps';
import { SharedModule } from '@aw-shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevolucaoPropostaRoutingModule } from './devolucao-proposta-routing.module';
import {
  AplicarDescontosComponent,
  DevolucaoPropostaComponent,
  EdificioComponent,
  FilterPavimentoItensPipe,
  ItemDetalhesComponent,
  ListaDocumentosComponent,
  ListaItemComponent,
  ModalReceberEscopoComponent,
  PreencherOrcamentoComponent,
  TableValoresComponent,
} from '.';
import { DevolucaoPropostaTabsComponent } from './devolucao-proposta-tabs/devolucao-proposta-tabs.component';
import { ItemOmissoComponent } from './steps/preencher-orcamento/edificio/andar/item-omisso/item-omisso.component';
import { ItemDetalhesValoresComponent } from './steps/shared/item-detalhes-valores/item-detalhes-valores.component';
import { FilterPavimentoAndaresPipe } from './steps/preencher-orcamento/filter-pavimento-andares.pipe';
import { EscopoComponent } from './steps/preencher-orcamento/edificio/andar/lista-item/item-detalhes/escopo/escopo.component';
import { DefinicaoEscopoSharedModule } from '../../grupo/definicao-escopo/shared/definicao-escopo-shared.module';
import { FilterEdificioPipe } from './steps/preencher-orcamento/filter-edificio.pipe';
import { GetAllItemsPipe } from './steps/preencher-orcamento/get-all-items.pipe';

@NgModule({
  declarations: [
    DevolucaoPropostaComponent,
    AplicarDescontosComponent,
    PreencherOrcamentoComponent,
    ModalReceberEscopoComponent,
    ListaDocumentosComponent,
    TableValoresComponent,
    AndarComponent,
    ListaItemComponent,
    EscopoComponent,
    ItemDetalhesComponent,
    FilterPavimentoItensPipe,
    DevolucaoPropostaTabsComponent,
    EdificioComponent,
    ItemOmissoComponent,
    ItemDetalhesValoresComponent,
    FilterPavimentoAndaresPipe,
    EscopoComponent,
    FilterEdificioPipe,
    GetAllItemsPipe,
  ],
  imports: [
    CommonModule,
    DevolucaoPropostaRoutingModule,
    SharedModule,
    AwComponentsModule,
    DefinicaoEscopoSharedModule,
  ],
})
export class DevolucaoPropostaModule {}
