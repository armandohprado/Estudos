import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefinicaoEscopoLojaInsumoComponent } from './definicao-escopo-loja-insumo.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { DefinicaoEscopoSharedModule } from '../definicao-escopo/shared/definicao-escopo-shared.module';
import { NgxsModule } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from './state/definicao-escopo-loja-insumo.state';
import { DeliGrupoItemComponent } from './deli-grupo-item/deli-grupo-item.component';
import { DeliGrupoItemListComponent } from './deli-grupo-item-list/deli-grupo-item-list.component';
import { DeliGrupoItemAcoesComponent } from './deli-grupo-item/deli-grupo-item-acoes/deli-grupo-item-acoes.component';
import { DeliGrupoItemContentComponent } from './deli-grupo-item/deli-grupo-item-content/deli-grupo-item-content.component';
import { DeliGiQuantificarComponent } from './deli-grupo-item/deli-grupo-item-content/deli-gi-quantificar/deli-gi-quantificar.component';
import { DeliGrupoItemFilhoComponent } from './deli-grupo-item-filho/deli-grupo-item-filho.component';
import { DeliGrupoItemFilhoContentComponent } from './deli-grupo-item-filho/deli-grupo-item-filho-content/deli-grupo-item-filho-content.component';
import { DefinicaoEscopoLojaInsumoSharedModule } from './shared/definicao-escopo-loja-insumo-shared.module';
import { DeliFilterCatalogoPipe } from './deli-grupo-item-filho/deli-grupo-item-filho-content/deli-filter-catalogo.pipe';

@NgModule({
  declarations: [
    DefinicaoEscopoLojaInsumoComponent,
    DeliGrupoItemComponent,
    DeliGrupoItemListComponent,
    DeliGrupoItemAcoesComponent,
    DeliGrupoItemContentComponent,
    DeliGiQuantificarComponent,
    DeliGrupoItemFilhoComponent,
    DeliGrupoItemFilhoContentComponent,
    DeliFilterCatalogoPipe,
  ],
  imports: [
    CommonModule,
    NgxsModule.forFeature([DefinicaoEscopoLojaInsumoState]),
    SharedModule,
    AwComponentsModule,
    DefinicaoEscopoSharedModule,
    DefinicaoEscopoLojaInsumoSharedModule,
  ],
  exports: [DefinicaoEscopoLojaInsumoComponent],
})
export class DefinicaoEscopoLojaInsumoModule {}
