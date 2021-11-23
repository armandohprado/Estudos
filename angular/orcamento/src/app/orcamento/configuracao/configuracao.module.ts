import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfiguracaoRoutingModule } from './configuracao-routing.module';
import { ConfiguracaoComponent } from './configuracao.component';
import { ModalOrcamentoComponent } from './modal-orcamento/modal-orcamento.component';
import { SharedModule } from '../../shared/shared.module';
import { AwComponentsModule } from '../../aw-components/aw-components.module';

@NgModule({
  declarations: [ConfiguracaoComponent, ModalOrcamentoComponent],
  imports: [CommonModule, ConfiguracaoRoutingModule, SharedModule, AwComponentsModule],
  exports: [ConfiguracaoComponent],
})
export class ConfiguracaoModule {}
