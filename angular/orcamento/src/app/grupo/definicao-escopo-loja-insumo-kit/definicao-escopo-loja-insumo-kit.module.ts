import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefinicaoEscopoLojaInsumoKitComponent } from './definicao-escopo-loja-insumo-kit.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { DefinicaoEscopoSharedModule } from '../definicao-escopo/shared/definicao-escopo-shared.module';
import { NgxsModule } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from './state/definicao-escopo-loja-insumo-kit.state';
import { DeliGrupoItemComponent } from './deli-grupo-item/deli-grupo-item.component';
import { DeliGrupoItemListComponent } from './deli-grupo-item-list/deli-grupo-item-list.component';
import { DeliGrupoItemAcoesComponent } from './deli-grupo-item/deli-grupo-item-acoes/deli-grupo-item-acoes.component';
import { DeliGrupoItemContentComponent } from './deli-grupo-item/deli-grupo-item-content/deli-grupo-item-content.component';
import { DeliGiQuantificarComponent } from './deli-grupo-item/deli-grupo-item-content/deli-gi-quantificar/deli-gi-quantificar.component';
import { DeliGrupoItemFilhoComponent } from './deli-grupo-item-filho/deli-grupo-item-filho.component';
import { DefinicaoEscopoLojaInsumoSharedModule } from '../definicao-escopo-loja-insumo/shared/definicao-escopo-loja-insumo-shared.module';

@NgModule({
  declarations: [
    DefinicaoEscopoLojaInsumoKitComponent,
    DeliGrupoItemComponent,
    DeliGrupoItemListComponent,
    DeliGrupoItemAcoesComponent,
    DeliGrupoItemContentComponent,
    DeliGiQuantificarComponent,
    DeliGrupoItemFilhoComponent,
  ],
  imports: [
    CommonModule,
    NgxsModule.forFeature([DefinicaoEscopoLojaInsumoKitState]),
    SharedModule,
    AwComponentsModule,
    DefinicaoEscopoSharedModule,
    DefinicaoEscopoLojaInsumoSharedModule,
  ],
  exports: [DefinicaoEscopoLojaInsumoKitComponent],
})
export class DefinicaoEscopoLojaInsumoKitModule {}
