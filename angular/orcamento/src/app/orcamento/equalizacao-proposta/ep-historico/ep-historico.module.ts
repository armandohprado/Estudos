import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpHistoricoComponent } from './ep-historico.component';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { SharedModule } from '@aw-shared/shared.module';

@NgModule({
  declarations: [EpHistoricoComponent],
  imports: [CommonModule, AwComponentsModule, SharedModule],
})
export class EpHistoricoModule {}
