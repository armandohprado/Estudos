import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrupoPropostaComponent } from './grupo-proposta.component';
import { StatusBudgetValuePipe } from './status-budget-value.pipe';
import { ModalUploadPropostaComponent } from './modal-upload-proposta/modal-upload-proposta.component';
import { ModalHistoricoPropostaComponent } from './modal-historico-proposta/modal-historico-proposta.component';
import { SharedModule } from '../shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { DesativaPropostaPipe } from './dasativa-proposta.pipe';
import { FuncionarioPopoverComponent } from './funcionario-popover/funcionario-popover.component';
import { NgxMaskModule } from 'ngx-mask';
import { PropostaInfoComponent } from './proposta/actions-proposta/proposta-info/proposta-info.component';
import { NgxsModule } from '@ngxs/store';
import { DefinicaoEscopoState } from './definicao-escopo/state/definicao-escopo.state';
import { DefinicaoEscopoLojaInsumoState } from './definicao-escopo-loja-insumo/state/definicao-escopo-loja-insumo.state';
import { DefinicaoEscopoLojaInsumoKitState } from './definicao-escopo-loja-insumo-kit/state/definicao-escopo-loja-insumo-kit.state';
import { DefinicaoEscopoGrupoTecnicoState } from './definicao-escopo-grupo-tecnico/state/definicao-escopo-grupo-tecnico.state';
import { ActionsPropostaComponent } from './proposta/actions-proposta/actions-proposta.component';
import { PropostaComponent } from './proposta/proposta.component';

@NgModule({
  declarations: [
    GrupoPropostaComponent,
    StatusBudgetValuePipe,
    ModalUploadPropostaComponent,
    ModalHistoricoPropostaComponent,
    DesativaPropostaPipe,
    FuncionarioPopoverComponent,
    PropostaInfoComponent,
    ActionsPropostaComponent,
    PropostaComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AwComponentsModule,
    NgxMaskModule.forChild(),
    NgxsModule.forFeature([
      DefinicaoEscopoState,
      DefinicaoEscopoLojaInsumoState,
      DefinicaoEscopoLojaInsumoKitState,
      DefinicaoEscopoGrupoTecnicoState,
    ]),
  ],
  exports: [GrupoPropostaComponent, FuncionarioPopoverComponent],
})
export class GrupoPropostaModule {}
