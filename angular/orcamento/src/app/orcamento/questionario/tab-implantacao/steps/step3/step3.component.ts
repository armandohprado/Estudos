import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  Projeto,
  QuestionarioImplantacaoByStep,
  QuestionarioImplantacaoStep3,
  QuestionarioModelo,
} from '../../../../../models';
import { QuestionarioService } from '../../../../../services/projeto/questionario.service';

@Component({
  selector: 'app-step3-implantacao',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss'],
})
export class Step3ImplantacaoComponent implements OnInit, OnChanges {
  projeto: Projeto = this.route.snapshot.data.projeto;
  formImplantacaoStep3: FormGroup;

  QuestionarioEnum = QuestionarioImplantacaoStep3;
  questionario: QuestionarioImplantacaoByStep;
  questionarioModelo = QuestionarioModelo;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private questionarioService: QuestionarioService
  ) {
    this.formImplantacaoStep3 = this.fb.group({});

    const allKeys = Object.keys(this.QuestionarioEnum);
    allKeys.forEach(item => {
      this.formImplantacaoStep3.addControl(this.QuestionarioEnum[item], new FormControl(null));
    });
  }

  @Input() formParent: QuestionarioImplantacaoByStep;
  @Output() changeTab = new EventEmitter<number>();

  ngOnChanges(): void {
    if (this.formParent) {
      this.formImplantacaoStep3.patchValue(this.formParent.passos.passo3);
    }
  }

  ngOnInit(): void {}

  sendForm(): void {
    const payload = {
      idQuestionario: this.formParent.idQuestionario,
      idQuestionarioModelo: this.questionarioModelo.IMPLANTACAO,
      idProjeto: this.projeto.idProjeto,
      questionarioRespostas: [],
    };

    const formKeys = Object.keys(this.QuestionarioEnum);

    formKeys.forEach(item => {
      const formItem = {
        nomeChave: this.QuestionarioEnum[item],
        valorChave: this.formImplantacaoStep3.get(this.QuestionarioEnum[item]).value,
      };

      payload.questionarioRespostas.push(formItem);
    });

    this.questionarioService.sendQuestionarioStep(this.questionarioModelo.IMPLANTACAO, payload).subscribe(() => {
      this.changeTab.emit(4);
    });
  }

  goToTab(tab: number): void {
    this.changeTab.emit(tab);
  }
}
