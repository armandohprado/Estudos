import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotacaoAdicionarFornecedorRoutingModule } from './cotacao-adicionar-fornecedor-routing.module';
import { CotacaoAdicionarFornecedorComponent } from './cotacao-adicionar-fornecedor.component';
import { AdicionarFornecedorModule } from '@aw-shared/adicionar-fornecedor/adicionar-fornecedor.module';

@NgModule({
  declarations: [CotacaoAdicionarFornecedorComponent],
  imports: [CommonModule, CotacaoAdicionarFornecedorRoutingModule, AdicionarFornecedorModule],
})
export class CotacaoAdicionarFornecedorModule {}
