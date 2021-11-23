import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DescongelarCronogramasRoutingModule } from './descongelar-cronogramas-routing.module';
import { DescongelarCronogramasComponent } from './descongelar-cronogramas.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AwSpinnerModule } from '../shared/aw-spinner/aw-spinner.module';
import { NgLetModule } from '../shared/ng-let/ng-let.module';
import { ConfirmModalModule } from '../shared/confirm-modal/confirm-modal.module';

@NgModule({
  declarations: [DescongelarCronogramasComponent],
  imports: [
    CommonModule,
    DescongelarCronogramasRoutingModule,
    ReactiveFormsModule,
    AwSpinnerModule,
    NgLetModule,
    ConfirmModalModule,
  ],
})
export class DescongelarCronogramasModule {}
