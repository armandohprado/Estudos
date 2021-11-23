import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmitirCcRoutingModule } from './emitir-cc-routing.module';
import { EmitirCcComponent } from './emitir-cc.component';
import { EmitirCcFornecedorComponent } from './emitir-cc-fornecedor/emitir-cc-fornecedor.component';
import { EmitirCcItemsComponent } from './emitir-cc-items/emitir-cc-items.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { NgxMaskModule } from 'ngx-mask';
import { EmitirCcFormComponent } from './emitir-cc-form/emitir-cc-form.component';
import { EmitirCcPlanoCompraQuestoesComponent } from './emitir-cc-plano-compra-questoes/emitir-cc-plano-compra-questoes.component';
import { SharedCompraModule } from '../../shared-compra/shared-compra.module';

@NgModule({
  declarations: [
    EmitirCcComponent,
    EmitirCcFornecedorComponent,
    EmitirCcItemsComponent,
    EmitirCcFormComponent,
    EmitirCcPlanoCompraQuestoesComponent,
  ],
  imports: [
    CommonModule,
    EmitirCcRoutingModule,
    SharedModule,
    AwComponentsModule,
    NgxMaskModule.forChild(),
    SharedCompraModule,
  ],
})
export class EmitirCcModule {}
