import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import {
  QuestionarioImplantacaoByStep,
  QuestionarioImplantacaoStep2,
  QuestionarioImplantacaoUploadType,
  QuestionarioModelo,
} from '../../../../../models';
import { QuestionarioService } from '@aw-services/projeto/questionario.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-step2-implantacao',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss'],
})
export class Step2ImplantacaoComponent implements OnInit, OnChanges {
  idProjeto = +this.route.snapshot.paramMap.get(RouteParamEnum.idProjeto);

  formImplantacaoStep2: FormGroup;
  fileSegTrabalho: string;
  fileIntegracao: string;

  fileSegTrabalhoMessage: string;
  fileIntegracaoMessage: string;

  QuestionarioEnum = QuestionarioImplantacaoStep2;
  questionarioImplantacaoUploadType = QuestionarioImplantacaoUploadType;
  questionario: QuestionarioImplantacaoByStep;
  questionarioModelo = QuestionarioModelo;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private questionarioService: QuestionarioService
  ) {
    this.formImplantacaoStep2 = this.fb.group({});

    const allKeys = Object.keys(this.QuestionarioEnum);
    allKeys.forEach(item => {
      this.formImplantacaoStep2.addControl(this.QuestionarioEnum[item], new FormControl(null));
    });
  }

  @Input() idQuestionario: number;
  @Input() formParent: QuestionarioImplantacaoByStep;

  @Output() changeTab = new EventEmitter<number>();

  ngOnChanges(): void {
    if (this.formParent) {
      this.formImplantacaoStep2.patchValue(this.formParent.passos.passo2);
    }
  }

  ngOnInit(): void {}

  fileSegTrabalhoUpload(file: File): void {
    this.fileSegTrabalho = file.name;
    this.fileSegTrabalhoMessage = `Enviando ${file.name}, aguarde...`;

    this.questionarioService
      .uploadFile(
        file,
        this.idProjeto,
        this.formParent.idQuestionario,
        this.questionarioImplantacaoUploadType.UPLOAD_SEG_TRABALHO
      )
      .pipe(
        catchAndThrow(() => {
          this.fileSegTrabalhoMessage = `Erro ao enviar arquivo ${file.name}`;
        })
      )
      .subscribe(() => {
        this.fileSegTrabalhoMessage = `Arquivo ${file.name} enviado com sucesso`;
      });
  }

  fileIntegracaoUpload(file: File): void {
    this.fileIntegracao = file.name;
    this.fileIntegracaoMessage = `Enviando ${file.name}, aguarde...`;

    this.questionarioService
      .uploadFile(
        file,
        this.idProjeto,
        this.formParent.idQuestionario,
        this.questionarioImplantacaoUploadType.UPLOAD_SEG_INTEGRACAO
      )
      .subscribe(
        () => {
          this.fileIntegracaoMessage = `Arquivo ${file.name} enviado com sucesso`;
        },
        () => {
          this.fileIntegracaoMessage = `Arquivo ${file.name} enviado com sucesso`;
        }
      );
  }

  sendForm(): void {
    const payload = {
      idQuestionario: this.formParent.idQuestionario,
      idQuestionarioModelo: this.questionarioModelo.IMPLANTACAO,
      idProjeto: this.idProjeto,
      questionarioRespostas: [],
    };

    const formKeys = Object.keys(this.QuestionarioEnum);

    formKeys.forEach(item => {
      const formItem = {
        nomeChave: this.QuestionarioEnum[item],
        valorChave: this.formImplantacaoStep2.get(this.QuestionarioEnum[item]).value,
      };

      payload.questionarioRespostas.push(formItem);
    });

    this.questionarioService.sendQuestionarioStep(this.questionarioModelo.IMPLANTACAO, payload).subscribe(() => {
      this.goToTab(3);
    });
  }

  goToTab(tab: number): void {
    this.changeTab.emit(tab);
  }
}
