import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Projeto, QuestionarioByStep, QuestionarioModelo, QuestionarioStep3 } from '../../../../../models';
import { QuestionarioService } from '../../../../../services/projeto/questionario.service';

@Component({
  selector: 'app-step3-faturamento',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss'],
})
export class Step3Component implements OnInit {
  projeto: Projeto = this.route.snapshot.data.projeto;
  questionarioEnum = QuestionarioStep3;
  form: FormGroup;

  @Input() formParent: any;

  questionario: QuestionarioByStep;

  @ViewChild('quantitativo1') quantitativo1: ElementRef;
  @ViewChild('quantitativo2') quantitativo2: ElementRef;
  @ViewChild('quantitativo3') quantitativo3: ElementRef;
  @ViewChild('quantitativo4') quantitativo4: ElementRef;
  @ViewChild('quantitativo5') quantitativo5: ElementRef;
  @ViewChild('quantitativo6') quantitativo6: ElementRef;
  @ViewChild('quantitativo7') quantitativo7: ElementRef;

  constructor(
    private fb: FormBuilder,
    private questionarioService: QuestionarioService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({});
    this.setUpForm();
  }

  setUpForm(): void {
    for (const key of Object.keys(this.questionarioEnum)) {
      this.form.addControl(
        this.questionarioEnum[key],
        this.fb.control(
          this.formParent.passos.passo3[this.questionarioEnum[key]]
            ? this.formParent.passos.passo3[this.questionarioEnum[key]]
            : ''
        )
      );
    }
  }

  sendForm(): void {
    const payload = {
      idQuestionario: this.formParent.idQuestionario,
      idProjeto: this.formParent.idProjeto,
      idQuestionarioModelo: this.formParent.idQuestionarioModelo || QuestionarioModelo.FATURAMENTO,
      questionarioRespostas: [],
    };

    if (this.quantitativo1.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.questionarioService.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_CONTRATACAO_FORMA, this.form)
      );
      payload.questionarioRespostas.push(
        this.questionarioService.addFieldToPayload(
          this.questionarioEnum.QUESTIONARIO_CONTRATACAO_FORNECEDORES,
          this.form
        )
      );
    }
    if (this.quantitativo2.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.questionarioService.addFieldToPayload(
          this.questionarioEnum.QUESTIONARIO_CONTRATACAO_FORNECEDORES,
          this.form
        )
      );
    }
    if (this.quantitativo3.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.questionarioService.addFieldToPayload(
          this.questionarioEnum.QUESTIONARIO_CONTRATACAO_FORNECEDORES_OUTROS,
          this.form
        )
      );
    }
    if (this.quantitativo4.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.questionarioService.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_CONTRATACAO_PROJETOCEI, this.form)
      );
    }
    if (this.quantitativo5.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.questionarioService.addFieldToPayload(
          this.questionarioEnum.QUESTIONARIO_CONTRATACAO_CADASTROGFIP,
          this.form
        )
      );
    }
    if (this.quantitativo6.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.questionarioService.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_CONTRATACAO_DIFAL, this.form)
      );
    }
    if (this.quantitativo7.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.questionarioService.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_CONTRATACAO_DIFAL, this.form)
      );
    }

    this.questionarioService.sendQuestionarioStep(3, payload).subscribe(() => {
      this.questionarioService.setActiveStep(this.questionarioService.activeTab$.value + 1);
    });
  }

  backTabQuestionario(): void {
    this.questionarioService.setActiveStep(this.questionarioService.activeTab$.value - 1);
  }
}
