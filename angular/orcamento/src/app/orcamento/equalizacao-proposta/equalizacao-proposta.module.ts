import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EqualizacaoPropostaComponent } from './equalizacao-proposta.component';
import { EpHeaderComponent } from './ep-header/ep-header.component';
import { SharedModule } from '@aw-shared/shared.module';
import { EqualizacaoPropostaRoutingModule } from './equalizacao-proposta-routing.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { EpHeaderFornecedoresComponent } from './ep-header-fornecedores/ep-header-fornecedores.component';
import { EpHeaderFornecedorComponent } from './ep-header-fornecedor/ep-header-fornecedor.component';
import { EpHeaderTotaisComponent } from './ep-header-totais/ep-header-totais.component';
import { EpTotalWidthDirective } from './ep-total-width.directive';
import { EpHeaderTotalComponent } from './ep-header-total/ep-header-total.component';
import { EpBannerComparativoComponent } from './ep-banner-comparativo/ep-banner-comparativo.component';
import { EpPropostaItemComponent } from './ep-proposta-item/ep-proposta-item.component';
import { EpPropostaItemFornecedorComponent } from './ep-proposta-item-fornecedor/ep-proposta-item-fornecedor.component';
import { EpItensOmissosComponent } from './ep-itens-omissos/ep-itens-omissos.component';
import { EpFornecedoresInfoComponent } from './ep-fornecedores-info/ep-fornecedores-info.component';

@NgModule({
  declarations: [
    EqualizacaoPropostaComponent,
    EpHeaderComponent,
    EpHeaderFornecedoresComponent,
    EpHeaderFornecedorComponent,
    EpHeaderTotaisComponent,
    EpTotalWidthDirective,
    EpHeaderTotalComponent,
    EpBannerComparativoComponent,
    EpPropostaItemComponent,
    EpPropostaItemFornecedorComponent,
    EpItensOmissosComponent,
    EpFornecedoresInfoComponent,
  ],
  imports: [CommonModule, EqualizacaoPropostaRoutingModule, SharedModule, AwComponentsModule],
})
export class EqualizacaoPropostaModule {}
