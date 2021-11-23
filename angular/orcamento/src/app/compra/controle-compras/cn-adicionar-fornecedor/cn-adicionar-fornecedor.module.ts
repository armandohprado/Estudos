import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CnAdicionarFornecedorRoutingModule } from './cn-adicionar-fornecedor-routing.module';
import { CnAdicionarFornecedorComponent } from './cn-adicionar-fornecedor.component';
import { AdicionarFornecedorModule } from '@aw-shared/adicionar-fornecedor/adicionar-fornecedor.module';

@NgModule({
  declarations: [CnAdicionarFornecedorComponent],
  imports: [CommonModule, CnAdicionarFornecedorRoutingModule, AdicionarFornecedorModule],
})
export class CnAdicionarFornecedorModule {}
