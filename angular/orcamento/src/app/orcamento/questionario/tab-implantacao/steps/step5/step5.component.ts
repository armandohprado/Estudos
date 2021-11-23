import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import {
  Projeto,
  QuestionarioImplantacaoByStep,
  QuestionarioImplantacaoStep5,
  QuestionarioModelo,
} from '../../../../../models';
import { QuestionarioService } from '../../../../../services/projeto/questionario.service';

@Component({
  selector: 'app-step5-implantacao',
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.scss'],
})
export class Step5ImplantacaoComponent implements OnInit, OnChanges {
  projeto: Projeto = this.route.snapshot.data.projeto;
  formImplantacaoStep5: FormGroup;

  QuestionarioEnum = QuestionarioImplantacaoStep5;
  questionarioModelo = QuestionarioModelo;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private questionarioService: QuestionarioService
  ) {
    this.formImplantacaoStep5 = this.fb.group({});

    const formKeys = Object.keys(this.QuestionarioEnum);
    formKeys.forEach(item => {
      this.formImplantacaoStep5.addControl(this.QuestionarioEnum[item], new FormControl(null));
    });
  }

  @Input() formParent: QuestionarioImplantacaoByStep;
  @Output() changeTab = new EventEmitter<number>();

  ngOnChanges(): void {
    if (this.formParent) {
      this.formImplantacaoStep5.patchValue(this.formParent.passos.passo5);
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
        valorChave: this.formImplantacaoStep5.get(this.QuestionarioEnum[item]).value,
      };

      payload.questionarioRespostas.push(formItem);
    });

    this.questionarioService.sendQuestionarioStep(this.questionarioModelo.IMPLANTACAO, payload).subscribe(() => {
      this.changeTab.emit(6);
    });
  }

  goToTab(tab: number): void {
    this.changeTab.emit(tab);
  }
}
