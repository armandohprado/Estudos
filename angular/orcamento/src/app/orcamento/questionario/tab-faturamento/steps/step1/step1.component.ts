import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Projeto, QuestionarioByStep, QuestionarioStep1 } from '../../../../../models';
import { QuestionarioService } from '../../../../../services/projeto/questionario.service';

@Component({
  selector: 'app-step1-faturamento',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
})
export class Step1FaturamentoComponent implements OnInit, OnDestroy {
  projeto: Projeto = this.route.snapshot.data.projeto;

  destroy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  bsConfig = {
    isAnimated: true,
    containerClass: 'theme-primary',
    dateInputFormat: 'DD/MM/YYYY',
  };

  QuestionarioEnum = QuestionarioStep1;
  questionario: QuestionarioByStep;

  form: FormGroup;
  formInterlocutores: FormArray;

  @Input() formParent: QuestionarioByStep;

  @ViewChild('quantitativo') quantitativo: ElementRef;
  @ViewChild('quantitativo2') quantitativo2: ElementRef;
  @ViewChild('quantitativo3') quantitativo3: ElementRef;
  @ViewChild('quantitativo4') quantitativo4: ElementRef;

  constructor(
    private fb: FormBuilder,
    private questionarioService: QuestionarioService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      [this.QuestionarioEnum.QUESTIONARIO_TIPO]: [1],
      [this.QuestionarioEnum.QUESTIONARIO_TIPO_NOME_PROFISSIONAL]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_TIPO_JUSTIFICATIVA]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_INICIAL_NOME_PROJETO]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_INICIAL_FUNCIONARIO]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_INICIAL_DATA]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_INICIAL_TIPO]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_INICIAL_QUESTIONARIO]: [''],
      interlocutoresGroup: this.fb.array([this.createInterlocutor()]),
    });
  }

  interlocutoresGroup: FormArray;

  ngOnInit(): void {
    this.interlocutoresGroup = this.form.get('interlocutoresGroup') as FormArray;

    for (let i = 1; i < this.formParent.passos.passo1.interlocutoresGroup.length; i++) {
      this.addInterlocutor();
    }
    this.form.patchValue(this.formParent.passos.passo1);
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.next(true);
  }

  enableFields(element): void {
    if (element.dataset?.id === 1) {
      if (!element.checked) {
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_NOME_PROJETO].disable();
      } else {
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_NOME_PROJETO].enable();
      }
    }
    if (element.dataset?.id === 2) {
      if (!element.checked) {
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_FUNCIONARIO].disable();
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_DATA].disable();
      } else {
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_FUNCIONARIO].enable();
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_DATA].enable();
      }
    }
    if (element.dataset?.id === 3) {
      if (!element.checked) {
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_TIPO].disable();
      } else {
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_TIPO].enable();
      }
    }
    if (element.dataset?.id === 4) {
      if (!element.checked) {
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_QUESTIONARIO].disable();
      } else {
        this.form.controls[this.QuestionarioEnum.QUESTIONARIO_INICIAL_QUESTIONARIO].enable();
      }
    }
  }

  selectCategoriaFormulario(categoria: number): void {
    this.form.get(this.QuestionarioEnum.QUESTIONARIO_TIPO).setValue(categoria);
  }

  addInterlocutor(): void {
    this.interlocutoresGroup.push(this.createInterlocutor());
  }

  deleteInterlocutor(i: number): void {
    // filter by ordem
    const payload = {
      idQuestionario: this.formParent.idQuestionario ? this.formParent.idQuestionario : 0,
      idQuestionarioModelo: 1,
      idProjeto: this.projeto.idProjeto,
      questionarioRespostas: [],
    };

    for (const field of Object.keys((this.interlocutores.controls[i] as FormArray).controls)) {
      const respostaParaSerDeletada = {
        nomechave: field,
        ordemChave: i,
        valorchave: '',
      };
      payload.questionarioRespostas.push(respostaParaSerDeletada);
    }

    this.questionarioService.deleteField(payload).subscribe(() => {
      this.interlocutores.controls.splice(i, 1);
    });
  }

  createInterlocutor(): FormGroup {
    return this.fb.group({
      [this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_NOME]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_CARGO]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_EMAIL]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_TELEFONE]: [''],
    });
  }

  get categoria(): any {
    return this.form.get(this.QuestionarioEnum.QUESTIONARIO_TIPO).value;
  }

  get interlocutores(): FormArray {
    return this.form.get('interlocutoresGroup') as FormArray;
  }

  sendForm(): void {
    const payload = {
      idQuestionario: this.formParent.idQuestionario ? this.formParent.idQuestionario : 0,
      idQuestionarioModelo: 1,
      idProjeto: this.projeto.idProjeto,
      questionarioRespostas: [
        {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_TIPO,
          valorchave: this.form.get(this.QuestionarioEnum.QUESTIONARIO_TIPO).value,
        },
      ],
    };

    if (this.form.get(this.QuestionarioEnum.QUESTIONARIO_TIPO).value === 1) {
      const referenciaNomeProfissional = this.addFieldToForm(this.QuestionarioEnum.QUESTIONARIO_TIPO_NOME_PROFISSIONAL);
      payload.questionarioRespostas.push(referenciaNomeProfissional);
    }
    if (this.form.get(this.QuestionarioEnum.QUESTIONARIO_TIPO).value === 2) {
      const interlocutores = this.interlocutores.controls;

      for (let i = 0; i < interlocutores.length; i++) {
        const refereniaInterlocutorNome = {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_NOME,
          valorchave: interlocutores[i].get(this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_NOME).value,
          ordemChave: i,
        };
        const refereniaInterlocutorEmail = {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_EMAIL,
          valorchave: interlocutores[i].get(this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_EMAIL).value,
          ordemChave: i,
        };
        const refereniaInterlocutorCargo = {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_CARGO,
          valorchave: interlocutores[i].get(this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_CARGO).value,
          ordemChave: i,
        };
        const refereniaInterlocutorTelefone = {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_TELEFONE,
          valorchave: interlocutores[i].get(this.QuestionarioEnum.QUESTIONARIO_INICIAL_INTERLOCUTOR_TELEFONE).value,
          ordemChave: i,
        };
        payload.questionarioRespostas.push(refereniaInterlocutorNome);
        payload.questionarioRespostas.push(refereniaInterlocutorEmail);
        payload.questionarioRespostas.push(refereniaInterlocutorCargo);
        payload.questionarioRespostas.push(refereniaInterlocutorTelefone);
      }
    }
    if (this.form.get(this.QuestionarioEnum.QUESTIONARIO_TIPO).value === 3) {
      const referenciaJustificativa = this.addFieldToForm(this.QuestionarioEnum.QUESTIONARIO_TIPO_JUSTIFICATIVA);
      payload.questionarioRespostas.push(referenciaJustificativa);
    }

    if (this.quantitativo.nativeElement.checked) {
      const referenciaNomeProjeto = this.addFieldToForm(this.QuestionarioEnum.QUESTIONARIO_INICIAL_NOME_PROJETO);
      payload.questionarioRespostas.push(referenciaNomeProjeto);
    }
    if (this.quantitativo2.nativeElement.checked) {
      const referenciaFuncionario = this.addFieldToForm(this.QuestionarioEnum.QUESTIONARIO_INICIAL_FUNCIONARIO);
      payload.questionarioRespostas.push(referenciaFuncionario);
      const referenciaData = this.addFieldToForm(this.QuestionarioEnum.QUESTIONARIO_INICIAL_DATA);
      payload.questionarioRespostas.push(referenciaData);
    }
    if (this.quantitativo3.nativeElement.checked) {
      const referenciaTipo = this.addFieldToForm(this.QuestionarioEnum.QUESTIONARIO_INICIAL_TIPO);
      payload.questionarioRespostas.push(referenciaTipo);
    }
    if (this.quantitativo4.nativeElement.checked) {
      const referenciaQuestionario = this.addFieldToForm(this.QuestionarioEnum.QUESTIONARIO_INICIAL_QUESTIONARIO);
      payload.questionarioRespostas.push(referenciaQuestionario);
    }

    this.questionarioService.sendQuestionarioStep(1, payload).subscribe(() => {
      this.questionarioService.setActiveStep(this.questionarioService.activeTab$.value + 1);
    });
  }

  addFieldToForm(
    field
  ): {
    nomechave: any;
    valorchave: any;
  } {
    return {
      nomechave: field,
      valorchave: this.form.get(field).value,
    };
  }
}
