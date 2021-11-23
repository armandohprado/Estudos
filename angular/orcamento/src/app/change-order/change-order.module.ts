import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { ChangeOrderRoutingModule } from './change-order-routing.module';
import { ChangeOrderComponent } from './change-order.component';
import { HeaderCoComponent } from './header-co/header-co.component';
import { ChangeOrderCardComponent } from './change-order-card/change-order-card.component';
import { ModalAprovarChangeOrderComponent } from './modal-aprovar-change-order/modal-aprovar-change-order.component';
import { ChangeOrderDetailsComponent } from './change-order-details/change-order-details.component';
import { SharedCompraModule } from '../compra/shared-compra/shared-compra.module';
import { CountGruposSelecionadosPipe } from './criar-change-order/familias-change-order/count-grupos-selecionados.pipe';
import { CriarChangeOrderComponent } from './criar-change-order/criar-change-order.component';
import { DadosChangeOrderComponent } from './criar-change-order/dados-change-order/dados-change-order.component';
import { FamiliasChangeOrderComponent } from './criar-change-order/familias-change-order/familias-change-order.component';
import { FamiliaChangeOrderComponent } from './criar-change-order/familias-change-order/familia-change-order/familia-change-order.component';
import { HasGroupsSelectedPipe } from './criar-change-order/familias-change-order/familia-change-order/has-groups-selected.pipe';

@NgModule({
  declarations: [
    ChangeOrderComponent,
    HeaderCoComponent,
    ChangeOrderCardComponent,
    ModalAprovarChangeOrderComponent,
    ChangeOrderDetailsComponent,
    CountGruposSelecionadosPipe,
    CriarChangeOrderComponent,
    DadosChangeOrderComponent,
    FamiliasChangeOrderComponent,
    FamiliaChangeOrderComponent,
    HasGroupsSelectedPipe,
  ],
  imports: [CommonModule, ChangeOrderRoutingModule, SharedModule, AwComponentsModule, SharedCompraModule],
  exports: [],
})
export class ChangeOrderModule {}
