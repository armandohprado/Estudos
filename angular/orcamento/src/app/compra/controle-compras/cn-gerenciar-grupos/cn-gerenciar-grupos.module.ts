import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CnGerenciarGruposComponent } from './cn-gerenciar-grupos.component';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CnGerenciarGruposComponent],
  imports: [CommonModule, AwComponentsModule, ReactiveFormsModule],
})
export class CnGerenciarGruposModule {}
