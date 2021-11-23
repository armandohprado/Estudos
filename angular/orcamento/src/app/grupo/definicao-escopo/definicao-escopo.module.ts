import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { DefinicaoEscopoComponent } from './definicao-escopo.component';
import { SharedModule } from '@aw-shared/shared.module';
import { DeInfoProjetoGrupoComponent } from './de-info-projeto-grupo/de-info-projeto-grupo.component';
import { DeGrupoItemListComponent } from './de-grupo-item-list/de-grupo-item-list.component';
import { DefinicaoEscopoState } from './state/definicao-escopo.state';
import { DeGrupoItemComponent } from './de-grupo-item/de-grupo-item.component';
import { DeGrupoItemContentComponent } from './de-grupo-item/de-grupo-item-content/de-grupo-item-content.component';
import { DeGrupoItemAcoesComponent } from './de-grupo-item/de-grupo-item-acoes/de-grupo-item-acoes.component';
import { DeGrupoItemAtributoComponent } from './de-grupo-item/de-grupo-item-content/de-grupo-item-atributo/de-grupo-item-atributo.component';
import { DefinicaoEscopoSharedModule } from './shared/definicao-escopo-shared.module';
import { DeGrupoItemDistribuirComponent } from './de-grupo-item/de-grupo-item-content/de-grupo-item-distribuir/de-grupo-item-distribuir.component';
import { DeGrupoItemPesquisaComponent } from './de-grupo-item/de-grupo-item-content/de-grupo-item-pesquisa/de-grupo-item-pesquisa.component';
import { DeGrupoItemInserirComponent } from './de-grupo-item-inserir/de-grupo-item-inserir.component';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { FindGrupoComboConteudoAtivoPipe } from './de-grupo-item/de-grupo-item-content/de-grupo-item-atributo/find-grupo-combo-conteudo-ativo.pipe';

@NgModule({
  declarations: [
    DefinicaoEscopoComponent,
    DeInfoProjetoGrupoComponent,
    DeGrupoItemListComponent,
    DeGrupoItemComponent,
    DeGrupoItemContentComponent,
    DeGrupoItemAcoesComponent,
    DeGrupoItemAtributoComponent,
    DeGrupoItemDistribuirComponent,
    DeGrupoItemPesquisaComponent,
    DeGrupoItemInserirComponent,
    FindGrupoComboConteudoAtivoPipe,
  ],
  exports: [DefinicaoEscopoComponent, DefinicaoEscopoSharedModule],
  imports: [
    CommonModule,
    SharedModule,
    NgxsModule.forFeature([DefinicaoEscopoState]),
    DefinicaoEscopoSharedModule,
    AwComponentsModule,
  ],
})
export class DefinicaoEscopoModule {}
