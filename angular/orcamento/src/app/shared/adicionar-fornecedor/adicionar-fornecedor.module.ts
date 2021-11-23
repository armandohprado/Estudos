import { NgModule } from '@angular/core';
import { AdicionarFornecedorComponent } from '@aw-shared/adicionar-fornecedor/adicionar-fornecedor.component';
import { AdicionarFornecedorFormComponent } from '@aw-shared/adicionar-fornecedor/adicionar-fornecedor-form/adicionar-fornecedor-form.component';
import { AdicionarFornecedorResumoComponent } from '@aw-shared/adicionar-fornecedor/adicionar-fornecedor-resumo/adicionar-fornecedor-resumo.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';

@NgModule({
  imports: [SharedModule, AwComponentsModule],
  declarations: [AdicionarFornecedorComponent, AdicionarFornecedorFormComponent, AdicionarFornecedorResumoComponent],
  exports: [AdicionarFornecedorComponent],
})
export class AdicionarFornecedorModule {}
