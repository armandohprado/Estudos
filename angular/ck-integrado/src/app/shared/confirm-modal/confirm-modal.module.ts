import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from './confirm-modal.component';
import { ConfirmModalService } from './confirm-modal.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AwSpinnerModule } from '../aw-spinner/aw-spinner.module';

@NgModule({
  declarations: [ConfirmModalComponent],
  imports: [CommonModule, ModalModule.forChild(), AwSpinnerModule],
})
export class ConfirmModalModule {
  static forRoot(): ModuleWithProviders<ConfirmModalModule> {
    return {
      ngModule: ConfirmModalModule,
      providers: [ConfirmModalService],
    };
  }
}
