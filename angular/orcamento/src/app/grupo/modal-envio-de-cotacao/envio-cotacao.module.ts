import { NgModule } from '@angular/core';
import { EnvioCotacaoComponent } from './envio-cotacao.component';
import { EnvioCotacaoContatoDatasComponent } from './steps/step-contato-datas/envio-cotacao-contato-datas.component';
import { EnvioCotacaoArquivosComponent } from './steps/step-arquivos/envio-cotacao-arquivos.component';
import { TabContentComponent } from './steps/step-arquivos/tab-content/tab-content.component';
import { TabAnexosAvulsosComponent } from './steps/step-arquivos/tab-anexos-avulsos/tab-anexos-avulsos.component';
import { EnvioCotacaoCondicoesFornecimentoComponent } from './steps/step-condicoes-fornecimento/envio-cotacao-condicoes-fornecimento.component';
import { EnvioCotacaoCondicoesEspecificasComponent } from './steps/step-condicoes-especificas/envio-cotacao-condicoes-especificas.component';
import { ModalRestricoesDaObraComponent } from './steps/step-condicoes-fornecimento/modal-restricoes-da-obra/modal-restricoes-da-obra.component';
import { EnvioCotacaoFornecedoresComponent } from './steps/step-fornecedores/envio-cotacao-fornecedores.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { GerenciadorAquivosSharedModule } from '../../orcamento/gerenciador-arquivos/shared/gerenciador-aquivos-shared.module';
import { EnvioCotacaoValidacaoGrupoItemComponent } from './steps/step-validacao-grupo-item/envio-cotacao-validacao-grupo-item.component';

@NgModule({
  imports: [CommonModule, SharedModule, AwComponentsModule, GerenciadorAquivosSharedModule],
  declarations: [
    EnvioCotacaoComponent,
    EnvioCotacaoContatoDatasComponent,
    EnvioCotacaoArquivosComponent,
    EnvioCotacaoCondicoesFornecimentoComponent,
    EnvioCotacaoCondicoesEspecificasComponent,
    TabContentComponent,
    TabAnexosAvulsosComponent,
    ModalRestricoesDaObraComponent,
    EnvioCotacaoFornecedoresComponent,
    EnvioCotacaoValidacaoGrupoItemComponent,
  ],
  exports: [EnvioCotacaoComponent],
})
export class EnvioCotacaoModule {}
