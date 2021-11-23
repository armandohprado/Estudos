import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import {
  Projeto,
  QuestionarioImplantacaoByStep,
  QuestionarioImplantacaoStep6,
  QuestionarioModelo,
} from '../../../../../models';
import { QuestionarioService } from '../../../../../services/projeto/questionario.service';

@Component({
  selector: 'app-step6-implantacao',
  templateUrl: './step6.component.html',
  styleUrls: ['./step6.component.scss'],
})
export class Step6ImplantacaoComponent implements OnInit, OnChanges {
  projeto: Projeto = this.route.snapshot.data.projeto;
  formImplantacaoStep6: FormGroup;

  QuestionarioEnum = QuestionarioImplantacaoStep6;
  questionarioModelo = QuestionarioModelo;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private questionarioService: QuestionarioService
  ) {
    this.formImplantacaoStep6 = this.fb.group({});

    const allKeys = Object.keys(this.QuestionarioEnum);
    allKeys.forEach(item => {
      this.formImplantacaoStep6.addControl(this.QuestionarioEnum[item], new FormControl(null));
    });
  }

  @Input() formParent: QuestionarioImplantacaoByStep;
  @Output() changeTab = new EventEmitter<number>();

  ngOnChanges(): void {
    if (this.formParent) {
      this.formImplantacaoStep6.patchValue(this.formParent.passos.passo6);
    }
  }

  ngOnInit(): void {}

  sendForm(): void {
    const payload = {
      idQuestionario: this.formParent.idQuestionario,
      idQuestionarioModelo: this.formParent.idQuestionarioModelo || QuestionarioModelo.IMPLANTACAO,
      idProjeto: this.projeto.idProjeto,
      questionarioRespostas: [],
    };

    const formKeys = Object.keys(this.QuestionarioEnum);

    formKeys.forEach(item => {
      const formItem = {
        nomeChave: this.QuestionarioEnum[item],
        valorChave: this.formImplantacaoStep6.get(this.QuestionarioEnum[item]).value,
      };

      payload.questionarioRespostas.push(formItem);
    });

    this.questionarioService.sendQuestionarioStep(this.questionarioModelo.IMPLANTACAO, payload).subscribe();
  }

  goToTab(tab: number): void {
    this.changeTab.emit(tab);
  }
}
