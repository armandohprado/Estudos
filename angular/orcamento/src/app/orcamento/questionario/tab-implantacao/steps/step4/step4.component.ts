import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  Projeto,
  QuestionarioImplantacaoByStep,
  QuestionarioImplantacaoStep4,
  QuestionarioImplantacaoUploadType,
  QuestionarioModelo,
} from '../../../../../models';
import { QuestionarioService } from '@aw-services/projeto/questionario.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-step4-implantacao',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.scss'],
})
export class Step4ImplantacaoComponent implements OnInit, OnChanges {
  @Input() idQuestionarioModelo: number;

  idProjeto = this.route.snapshot.paramMap.get(RouteParamEnum.idProjeto);

  fileIsencao: string;
  fileIsencaoMessage: string;
  questionarioUploadType = QuestionarioImplantacaoUploadType;

  projeto: Projeto = this.route.snapshot.data.projeto;
  formImplantacaoStep4: FormGroup;

  QuestionarioEnum = QuestionarioImplantacaoStep4;
  questionario: QuestionarioImplantacaoByStep;
  questionarioModelo = QuestionarioModelo;

  constructor(
    private questionarioService: QuestionarioService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.formImplantacaoStep4 = this.fb.group({});

    const formKeys = Object.keys(this.QuestionarioEnum);
    formKeys.forEach(item => {
      this.formImplantacaoStep4.addControl(this.QuestionarioEnum[item], new FormControl(null));
    });
  }

  @Input() formParent: QuestionarioImplantacaoByStep;
  @Output() changeTab = new EventEmitter<number>();

  ngOnChanges(): void {
    if (this.formParent) {
      this.formImplantacaoStep4.patchValue(this.formParent.passos.passo4);
    }
  }

  ngOnInit(): void {}

  fileIsencaoUpload(file: File): void {
    this.fileIsencao = file.name;
    this.fileIsencaoMessage = `Enviando ${file.name}, aguarde...`;

    this.questionarioService
      .uploadFile(
        file,
        this.idProjeto,
        this.formParent.idQuestionario,
        this.questionarioUploadType.UPLOAD_ISENCAO_RESPONSABILIDADE
      )
      .pipe(
        catchAndThrow(() => {
          this.fileIsencaoMessage = `Erro ao enviar arquivo ${file.name}`;
        })
      )
      .subscribe(() => {
        this.fileIsencaoMessage = `Arquivo ${file.name} enviado com sucesso`;
      });
  }

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
        valorChave: this.formImplantacaoStep4.get(this.QuestionarioEnum[item]).value,
      };

      payload.questionarioRespostas.push(formItem);
    });

    this.questionarioService.sendQuestionarioStep(this.questionarioModelo.IMPLANTACAO, payload).subscribe(() => {
      this.changeTab.emit(5);
    });
  }

  goToTab(tab: number): void {
    this.changeTab.emit(tab);
  }
}
