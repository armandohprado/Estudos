import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GerenciadorArquivosComponent } from './gerenciador-arquivos.component';
import { SharedModule } from '../../shared/shared.module';
import { AwComponentsModule } from '../../aw-components/aw-components.module';
import { GerenciadorArquivosRoutingModule } from './gerenciador-arquivos-routing.module';
import { GaSelectOrcamentoGrupoComponent } from './ga-select-orcamento-grupo/ga-select-orcamento-grupo.component';
import { GaModalComponent } from './ga-modal/ga-modal.component';
import { GaEtapasComponent } from './ga-etapas/ga-etapas.component';
import { GaPavimentosComponent } from './ga-pavimentos/ga-pavimentos.component';
import { GaPavimentoComponent } from './ga-pavimentos/ga-pavimento/ga-pavimento.component';
import { GaFormComponent } from './ga-form/ga-form.component';
import { GaAtividadesComponent } from './ga-atividades/ga-atividades.component';
import { GaAtividadeComponent } from './ga-atividades/ga-atividade/ga-atividade.component';
import { GaArquivosComponent } from './ga-atividades/ga-arquivos/ga-arquivos.component';
import { GaArquivoAcoesComponent } from './ga-atividades/ga-arquivo-acoes/ga-arquivo-acoes.component';
import { GaArquivosFilterPipe } from './ga-atividades/ga-arquivos/ga-arquivos-filter.pipe';
import { GaBottomNavComponent } from './ga-bottom-nav/ga-bottom-nav.component';
import { GaGruposComponent } from './ga-atividades/ga-grupos/ga-grupos.component';
import { GaAddGruposComponent } from './ga-atividades/ga-add-grupos/ga-add-grupos.component';
import { GaGruposSelecionadosPipe } from './ga-atividades/ga-add-grupos/ga-grupos-selecionados.pipe';
import { GerenciadorAquivosSharedModule } from './shared/gerenciador-aquivos-shared.module';
import { GaAnexosAvulsosWrapperComponent } from './ga-anexos-avulsos/ga-anexos-avulsos-wrapper.component';

@NgModule({
  declarations: [
    GerenciadorArquivosComponent,
    GaSelectOrcamentoGrupoComponent,
    GaModalComponent,
    GaEtapasComponent,
    GaPavimentosComponent,
    GaPavimentoComponent,
    GaFormComponent,
    GaAtividadesComponent,
    GaAtividadeComponent,
    GaArquivosComponent,
    GaArquivoAcoesComponent,
    GaArquivosFilterPipe,
    GaBottomNavComponent,
    GaGruposComponent,
    GaAddGruposComponent,
    GaGruposSelecionadosPipe,
    GaAnexosAvulsosWrapperComponent,
  ],
  imports: [
    CommonModule,
    GerenciadorArquivosRoutingModule,
    SharedModule,
    AwComponentsModule,
    GerenciadorAquivosSharedModule,
  ],
  exports: [GerenciadorArquivosComponent, GaModalComponent],
})
export class GerenciadorArquivosModule {}
