import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionarioRoutingModule } from './questionario-routing.module';
import { QuestionarioComponent } from './questionario.component';
import { TabFaturamentoComponent } from './tab-faturamento/tab-faturamento.component';
import { TabImplantacaoComponent } from './tab-implantacao/tab-implantacao.component';

import { SharedModule } from '../../shared/shared.module';

import { Step1FaturamentoComponent } from './tab-faturamento/steps/step1/step1.component';
import { Step2Component } from './tab-faturamento/steps/step2/step2.component';
import { Step3Component } from './tab-faturamento/steps/step3/step3.component';
import { Step4Component } from './tab-faturamento/steps/step4/step4.component';

import { Step1ImplantacaoComponent } from './tab-implantacao/steps/step1/step1.component';
import { Step2ImplantacaoComponent } from './tab-implantacao/steps/step2/step2.component';
import { Step3ImplantacaoComponent } from './tab-implantacao/steps/step3/step3.component';
import { Step4ImplantacaoComponent } from './tab-implantacao/steps/step4/step4.component';
import { Step5ImplantacaoComponent } from './tab-implantacao/steps/step5/step5.component';
import { Step6ImplantacaoComponent } from './tab-implantacao/steps/step6/step6.component';
import { AwComponentsModule } from '../../aw-components/aw-components.module';

@NgModule({
  declarations: [
    QuestionarioComponent,
    TabFaturamentoComponent,
    TabImplantacaoComponent,
    Step1FaturamentoComponent,
    Step2Component,
    Step3Component,
    Step4Component,
    Step1ImplantacaoComponent,
    Step2ImplantacaoComponent,
    Step3ImplantacaoComponent,
    Step4ImplantacaoComponent,
    Step5ImplantacaoComponent,
    Step6ImplantacaoComponent,
  ],
  exports: [TabFaturamentoComponent, TabImplantacaoComponent],
  imports: [CommonModule, QuestionarioRoutingModule, SharedModule, AwComponentsModule],
})
export class QuestionarioModule {}
