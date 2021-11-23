import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControleComprasRoutingModule } from './controle-compras-routing.module';
import { ControleComprasComponent } from './controle-compras.component';
import { SharedModule } from '@aw-shared/shared.module';
import { HeaderCcComponent } from './main/header-cc/header-cc.component';
import { LinksCcComponent } from './main/links-cc/links-cc.component';
import { FiltersCcComponent } from './main/filters-cc/filters-cc.component';
import { CollapseGruposCcComponent } from './main/collapse-grupos-cc/collapse-grupos-cc.component';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { ListaGruposCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/lista-grupos-cc.component';
import { HeaderGrupoCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/header-grupo-cc/header-grupo-cc.component';
import { BodyHeaderGrupoCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-header-grupo-cc.component';
import { BodyGrupoCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/body-grupo-cc.component';
import { TabOrcamentoCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-orcamento-cc/tab-orcamento-cc.component';
import { TabCompraNegociacaoCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-compra-negociacao-cc/tab-compra-negociacao-cc.component';
import { TabConfirmacaoCompraCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/tab-confirmacao-compra-cc.component';
import { MapaCollapseCompraNegociacaoCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-compra-negociacao-cc/mapa-collapse-compra-negociacao-cc/mapa-collapse-compra-negociacao-cc.component';
import { TransacaoCollapseCompraNegociacaoCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-compra-negociacao-cc/transacao-collapse-compra-negociacao-cc/transacao-collapse-compra-negociacao-cc.component';
import { MapaResumoComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-compra-negociacao-cc/mapa-collapse-compra-negociacao-cc/mapa-resumo/mapa-resumo.component';
import { MapasDetalhesComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-compra-negociacao-cc/mapa-collapse-compra-negociacao-cc/mapas-detalhes/mapas-detalhes.component';
import { HeaderGrupoCcColComponent } from './main/collapse-grupos-cc/lista-grupos-cc/header-grupo-cc/header-grupo-cc-col.component';
import { GrupoPropostaModule } from '../../grupo/grupo-proposta.module';
import { FormEntregaCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/form-entrega-cc/form-entrega-cc.component';
import { NgxMaskModule } from 'ngx-mask';
import { ListaEmitirCcComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/lista-emitir-cc/lista-emitir-cc.component';
import { ModalMudarFaturamentoComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/modal-mudar-faturamento/modal-mudar-faturamento.component';
import { SharedCompraModule } from '../shared-compra/shared-compra.module';
import { ModalMiscellaneousComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-compra-negociacao-cc/modal-miscellaneous/modal-miscellaneous.component';
import { CnEstouroBudgetComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/cn-estouro-budget/cn-estouro-budget.component';
import { CnValidaFichaEstouroPipe } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/cn-estouro-budget/valida-ficha-estouro.pipe';
import { CnExibeFormConfirmacaoCompraPipe } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/exibe-form-confirmacao-compra.pipe';
import { CnEstouroBudgetFichasComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/cn-estouro-budget-fichas/cn-estouro-budget-fichas.component';
import { CnTabMigracaoBudgetComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/cn-tab-migracao-budget/cn-tab-migracao-budget.component';
import { CnMigracaoBudgetGruposTransferenciaComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/cn-tab-migracao-budget/cn-migracao-budget-grupos-transferencia/cn-migracao-budget-grupos-transferencia.component';
import { CnMigracaoBudgetResumoComponent } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/cn-tab-migracao-budget/cn-migracao-budget-resumo/cn-migracao-budget-resumo.component';
import { CnMigracaoBudgetGruposInvalidPipe } from './main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/cn-tab-migracao-budget/cn-migracao-budget-grupos-transferencia/cn-migracao-budget-grupos-invalid.pipe';

@NgModule({
  declarations: [
    ControleComprasComponent,
    HeaderCcComponent,
    LinksCcComponent,
    FiltersCcComponent,
    CollapseGruposCcComponent,
    ListaGruposCcComponent,
    HeaderGrupoCcComponent,
    BodyHeaderGrupoCcComponent,
    BodyGrupoCcComponent,
    TabOrcamentoCcComponent,
    TabCompraNegociacaoCcComponent,
    TabConfirmacaoCompraCcComponent,
    MapaCollapseCompraNegociacaoCcComponent,
    TransacaoCollapseCompraNegociacaoCcComponent,
    MapaResumoComponent,
    MapasDetalhesComponent,
    HeaderGrupoCcColComponent,
    FormEntregaCcComponent,
    ListaEmitirCcComponent,
    ModalMudarFaturamentoComponent,
    ModalMiscellaneousComponent,
    CnEstouroBudgetComponent,
    CnValidaFichaEstouroPipe,
    CnExibeFormConfirmacaoCompraPipe,
    CnEstouroBudgetFichasComponent,
    CnTabMigracaoBudgetComponent,
    CnMigracaoBudgetGruposTransferenciaComponent,
    CnMigracaoBudgetResumoComponent,
    CnMigracaoBudgetGruposInvalidPipe,
  ],
  imports: [
    CommonModule,
    ControleComprasRoutingModule,
    SharedModule,
    AwComponentsModule,
    GrupoPropostaModule,
    NgxMaskModule.forChild(),
    SharedCompraModule,
  ],
})
export class ControleComprasModule {}
