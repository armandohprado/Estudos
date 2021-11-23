import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PcFornecedoresRoutingModule } from './pc-fornecedores-routing.module';
import { PcFornecedoresComponent } from './pc-fornecedores.component';
import { AwComponentsModule } from '../../../aw-components/aw-components.module';

@NgModule({
  declarations: [PcFornecedoresComponent],
  imports: [CommonModule, PcFornecedoresRoutingModule, AwComponentsModule],
})
export class PcFornecedoresModule {}
