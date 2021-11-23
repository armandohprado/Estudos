// tslint:disable:max-line-length
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefinicaoEscopoGrupoTecnicoComponent } from './definicao-escopo-grupo-tecnico.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { DefinicaoEscopoSharedModule } from '../definicao-escopo/shared/definicao-escopo-shared.module';
import { NgxsModule } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from './state/definicao-escopo-grupo-tecnico.state';
import { DetGrupoItemComponent } from './det-grupo-item/det-grupo-item.component';
import { DetGrupoItemListComponent } from './det-grupo-item-list/det-grupo-item-list.component';
import { DetGrupoItemAcoesComponent } from './det-grupo-item/det-grupo-item-acoes/det-grupo-item-acoes.component';
import { DetGrupoItemContentComponent } from './det-grupo-item/det-grupo-item-content/det-grupo-item-content.component';
import { DetGrupoItemFilhoComponent } from './det-grupo-item-filho/det-grupo-item-filho.component';
import { DetGrupoItemFilhoContentComponent } from './det-grupo-item-filho/det-grupo-item-filho-content/det-grupo-item-filho-content.component';
import { DefinicaoEscopoLojaInsumoSharedModule } from '../definicao-escopo-loja-insumo/shared/definicao-escopo-loja-insumo-shared.module';
import { DetGrupoItemFilhoQuantificarComponent } from './det-grupo-item-filho/det-grupo-item-filho-quantificar/det-grupo-item-filho-quantificar.component';
import { DetGrupoItemFilhoAmbientesComponent } from './det-grupo-item-filho/det-grupo-item-filho-ambientes/det-grupo-item-filho-ambientes.component';
import { DetGrupoItemFilhoAmbientesModalComponent } from './det-grupo-item-filho/det-grupo-item-filho-ambientes-modal/det-grupo-item-filho-ambientes-modal.component';

@NgModule({
  declarations: [
    DefinicaoEscopoGrupoTecnicoComponent,
    DetGrupoItemComponent,
    DetGrupoItemListComponent,
    DetGrupoItemAcoesComponent,
    DetGrupoItemContentComponent,
    DetGrupoItemFilhoQuantificarComponent,
    DetGrupoItemFilhoComponent,
    DetGrupoItemFilhoContentComponent,
    DetGrupoItemFilhoAmbientesComponent,
    DetGrupoItemFilhoAmbientesModalComponent,
  ],
  imports: [
    CommonModule,
    NgxsModule.forFeature([DefinicaoEscopoGrupoTecnicoState]),
    SharedModule,
    AwComponentsModule,
    DefinicaoEscopoSharedModule,
    DefinicaoEscopoLojaInsumoSharedModule,
  ],
  exports: [DefinicaoEscopoGrupoTecnicoComponent],
})
export class DefinicaoEscopoGrupoTecnicoModule {}
