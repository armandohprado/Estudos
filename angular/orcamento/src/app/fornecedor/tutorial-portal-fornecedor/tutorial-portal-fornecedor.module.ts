import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TutorialPortalFornecedorRoutingModule } from './tutorial-portal-fornecedor-routing.module';
import { TutorialPortalFornecedorComponent } from './tutorial-portal-fornecedor.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';

@NgModule({
  declarations: [TutorialPortalFornecedorComponent],
  imports: [CommonModule, TutorialPortalFornecedorRoutingModule, SharedModule, AwComponentsModule],
})
export class TutorialPortalFornecedorModule {}
