import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CnAdicionarGruposComponent } from './cn-adicionar-grupos.component';
import { CnAgGrupoComponent } from './cn-ag-grupo/cn-ag-grupo.component';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { SharedModule } from '@aw-shared/shared.module';

@NgModule({
  declarations: [CnAdicionarGruposComponent, CnAgGrupoComponent],
  imports: [CommonModule, AwComponentsModule, SharedModule],
})
export class CnAdicionarGruposModule {}
