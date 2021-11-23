import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CotacaoRoutingModule } from './cotacao-routing.module';
import { CotacaoComponent } from './cotacao.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { GrupoPropostaModule } from '../../grupo/grupo-proposta.module';

@NgModule({
  declarations: [CotacaoComponent],
  imports: [CommonModule, CotacaoRoutingModule, SharedModule, AwComponentsModule, GrupoPropostaModule],
})
export class CotacaoModule {}
