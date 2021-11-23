import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Projeto } from '../../../models';
import {
  Questionario,
  QuestionarioByStep,
  QuestionarioModelo,
  QuestionarioStep1,
  QuestionarioStep2,
  QuestionarioStep3,
  QuestionarioStep4,
} from '../../../models';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { QuestionarioService } from '../../../services/projeto/questionario.service';

@Component({
  selector: 'app-tab-faturamento',
  templateUrl: './tab-faturamento.component.html',
  styleUrls: ['./tab-faturamento.component.scss'],
})
export class TabFaturamentoComponent implements OnInit {
  faturamentoSteps: FormGroup = this.fb.group({});

  questionarioModelo = QuestionarioModelo;
  questionario: QuestionarioByStep;

  questionarioStep1 = QuestionarioStep1;
  questionarioStep2 = QuestionarioStep2;
  questionarioStep3 = QuestionarioStep3;
  questionarioStep4 = QuestionarioStep4;

  activeTab$ = this.questionarioService.activeTab$;

  @Input() projeto: Projeto;

  @ViewChild('staticTabs') staticTabs: TabsetComponent;

  constructor(private fb: FormBuilder, private questionarioService: QuestionarioService) {}

  ngOnInit(): void {
    this.questionarioService
      .getQuestionario(this.projeto.idProjeto, this.questionarioModelo.FATURAMENTO)
      .subscribe((data: Questionario) => {
        this.questionario = this.questionarioService.stripFields(data);
        this.setUpForm(this.questionario);
      });

    this.activeTab$.subscribe((data: number) => {
      this.selectTab(data);
    });
  }

  private setUpForm(savedInfo: QuestionarioByStep): void {
    this.faturamentoSteps = this.fb.group({
      tab1: this.fb.group({
        [this.questionarioStep1.QUESTIONARIO_TIPO]: [1],
        [this.questionarioStep1.QUESTIONARIO_TIPO_NOME_PROFISSIONAL]: [''],
        [this.questionarioStep1.QUESTIONARIO_TIPO_JUSTIFICATIVA]: [''],
        [this.questionarioStep1.QUESTIONARIO_INICIAL_NOME_PROJETO]: [''],
        [this.questionarioStep1.QUESTIONARIO_INICIAL_FUNCIONARIO]: [''],
        [this.questionarioStep1.QUESTIONARIO_INICIAL_DATA]: [''],
        [this.questionarioStep1.QUESTIONARIO_INICIAL_TIPO]: [''],
        [this.questionarioStep1.QUESTIONARIO_INICIAL_QUESTIONARIO]: [''],
        interlocutoresGroup: this.fb.array([this.createInterlocutor()]),
      }),
      tab2: this.fb.group({
        empresasGroup: this.fb.array([this.createEmpresa()]),
        [this.questionarioStep2.QUESTIONARIO_EMPRESA_ENDERECO_ENTREGA]: [''],
      }),
      tab3: this.fb.group({}),
      tab4: this.fb.group({}),
    });

    this.setTabControls(3);
    this.setTabControls(4);

    this.faturamentoSteps.get('tab1').patchValue(savedInfo.passos.passo1);
    this.faturamentoSteps.get('tab2').patchValue(savedInfo.passos.passo2);
    this.faturamentoSteps.get('tab3').patchValue(savedInfo.passos.passo3);
    this.faturamentoSteps.get('tab4').patchValue(savedInfo.passos.passo4);
  }

  private createInterlocutor(): FormGroup {
    return this.fb.group({
      [this.questionarioStep1.QUESTIONARIO_INICIAL_INTERLOCUTOR_NOME]: [''],
      [this.questionarioStep1.QUESTIONARIO_INICIAL_INTERLOCUTOR_CARGO]: [''],
      [this.questionarioStep1.QUESTIONARIO_INICIAL_INTERLOCUTOR_EMAIL]: [''],
      [this.questionarioStep1.QUESTIONARIO_INICIAL_INTERLOCUTOR_TELEFONE]: [''],
    });
  }

  private createEmpresa(): FormGroup {
    return this.fb.group({
      active: [true],
      [this.questionarioStep2.QUESTIONARIO_EMPRESA_RAZAO]: [''],
      [this.questionarioStep2.QUESTIONARIO_EMPRESA_ENDERECO]: [''],
      [this.questionarioStep2.QUESTIONARIO_EMPRESA_COMPLEMENTO]: [''],
      [this.questionarioStep2.QUESTIONARIO_EMPRESA_BAIRRO]: [''],
      [this.questionarioStep2.QUESTIONARIO_EMPRESA_CNPJ]: [''],
      [this.questionarioStep2.QUESTIONARIO_EMPRESA_INSCRICAO]: [''],
      [this.questionarioStep2.QUESTIONARIO_EMPRESA_ESTADO]: [''],
      [this.questionarioStep2.QUESTIONARIO_EMPRESA_CIDADE]: [''],
    });
  }

  private setTabControls(num: number): void {
    let currentStep;

    if (num === 3) currentStep = this.questionarioStep3;
    if (num === 4) currentStep = this.questionarioStep4;

    for (const key of Object.keys(currentStep)) {
      (this.faturamentoSteps.get('tab' + num) as FormGroup).addControl(
        currentStep[key],
        this.fb.control(
          this.questionario.passos['passo' + num][currentStep[key]]
            ? this.questionario.passos['passo' + num][currentStep[key]]
            : ''
        )
      );
    }
  }

  selectTab(step: number): void {
    if (this.staticTabs?.tabs.length) {
      this.staticTabs.tabs[step].active = true;
    }
  }

  setActiveTab(tab: number): void {
    this.questionarioService.setActiveStep(tab);
  }
}
