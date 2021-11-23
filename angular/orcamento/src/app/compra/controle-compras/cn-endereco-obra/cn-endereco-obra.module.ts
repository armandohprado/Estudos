import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CnEnderecoObraComponent } from './cn-endereco-obra.component';
import { CnEnderecoObraFormComponent } from './cn-endereco-obra-form/cn-endereco-obra-form.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [CnEnderecoObraComponent, CnEnderecoObraFormComponent],
  imports: [CommonModule, SharedModule, AwComponentsModule, NgxMaskModule.forChild()],
})
export class CnEnderecoObraModule {}
