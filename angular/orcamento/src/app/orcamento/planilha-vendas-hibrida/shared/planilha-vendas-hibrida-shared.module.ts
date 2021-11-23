import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhGerenciarGruposDuplicarComponent } from './gerenciar-grupos-duplicar/ph-gerenciar-grupos-duplicar.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { PhGerenciarGruposComponent } from './gerenciar-grupos/ph-gerenciar-grupos.component';

const DECLARATIONS = [PhGerenciarGruposDuplicarComponent, PhGerenciarGruposComponent];

@NgModule({
  declarations: [...DECLARATIONS],
  imports: [CommonModule, SharedModule, AwComponentsModule],
  exports: [...DECLARATIONS],
})
export class PlanilhaVendasHibridaSharedModule {}
