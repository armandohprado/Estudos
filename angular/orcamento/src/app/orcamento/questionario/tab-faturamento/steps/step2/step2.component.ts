import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { QuestionarioService } from '@aw-services/projeto/questionario.service';
import {
  Projeto,
  QuestionarioByStep,
  QuestionarioModelo,
  QuestionarioStep2,
  QuestionarioUploadType,
} from '../../../../../models';
import { isObject } from 'lodash-es';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-step2-faturamento',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss'],
})
export class Step2Component implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private questionarioService: QuestionarioService
  ) {}

  @ViewChild('quantitativoEntrega')
  quantitativoEntrega: ElementRef;

  fileUploadError = false;
  questionarioUploadType = QuestionarioUploadType;
  isLoading: { btnId: any; status: boolean } = { btnId: '', status: false };
  projeto: Projeto = this.route.snapshot.data.projeto;

  form: FormGroup;
  empresasGroup: FormArray;
  questionario: QuestionarioByStep;
  questionarioEnum = QuestionarioStep2;
  questionarioModelo = QuestionarioModelo;

  files = [{ fileName: null, fileExtension: null }];

  @Input() idQuestionarioModelo: number;
  @Input() idQuestionario: number;
  @Input() formParent: any;

  idProjeto = this.route.snapshot.paramMap.get(RouteParamEnum.idProjeto);

  ngOnInit(): void {
    this.form = this.fb.group({
      empresasGroup: this.fb.array([]),
      [this.questionarioEnum.QUESTIONARIO_EMPRESA_ENDERECO_ENTREGA]: [''],
    });
    this.empresasGroup = this.form.get('empresasGroup') as FormArray;
    this.addEmpresa();
    this.form.patchValue(this.formParent.passos.passo2);
  }

  setUpForm(): void {
    for (const key in Object.keys(this.questionarioEnum)) {
      if (isObject(this.formParent.passos.passo2[key])) {
        this.form.get('empresasGroup').patchValue(this.formParent.passos.passo2[key]);
      } else {
        this.form.addControl(
          this.questionarioEnum[key],
          this.fb.control(
            this.formParent.passos.passo2[this.questionarioEnum[key]]
              ? this.formParent.passos.passo2[this.questionarioEnum[key]]
              : ''
          )
        );
      }
    }
  }

  createEmpresa(): FormGroup {
    this.files.push({ fileName: null, fileExtension: null });

    return this.fb.group({
      active: [true],
      [this.questionarioEnum.QUESTIONARIO_EMPRESA_RAZAO]: [''],
      [this.questionarioEnum.QUESTIONARIO_EMPRESA_ENDERECO]: [''],
      [this.questionarioEnum.QUESTIONARIO_EMPRESA_COMPLEMENTO]: [''],
      [this.questionarioEnum.QUESTIONARIO_EMPRESA_BAIRRO]: [''],
      [this.questionarioEnum.QUESTIONARIO_EMPRESA_CNPJ]: [''],
      [this.questionarioEnum.QUESTIONARIO_EMPRESA_INSCRICAO]: [''],
      [this.questionarioEnum.QUESTIONARIO_EMPRESA_ESTADO]: [''],
      [this.questionarioEnum.QUESTIONARIO_EMPRESA_CIDADE]: [''],
    });
  }

  get empresas(): FormArray {
    return this.form.get('empresasGroup') as FormArray;
  }

  addEmpresa(): void {
    this.empresasGroup.push(this.createEmpresa());
  }

  deleteEmpresa(i: number): void {
    const payload = {
      idQuestionario: this.formParent.idQuestionario ? this.formParent.idQuestionario : 0,
      idQuestionarioModelo: 1,
      idProjeto: this.projeto.idProjeto,
      questionarioRespostas: [],
    };

    for (const field in (this.empresas.controls[i] as FormGroup).controls) {
      if (field !== 'active') {
        const respostaParaSerDeletada = {
          nomechave: field,
          ordemChave: i,
          valorchave: '',
        };
        payload.questionarioRespostas.push(respostaParaSerDeletada);
      }
    }

    this.questionarioService.deleteField(payload).subscribe(() => {
      this.empresas.controls.splice(i, 1);
    });
  }

  sendForm(): void {
    const payload = {
      idQuestionario: this.formParent.idQuestionario,
      idQuestionarioModelo: this.questionarioModelo.FATURAMENTO,
      idProjeto: this.projeto.idProjeto,
      questionarioRespostas: [],
    };

    if (this.quantitativoEntrega.nativeElement.checked) {
      const index = this.form.get(this.questionarioEnum.QUESTIONARIO_EMPRESA_ENDERECO_ENTREGA).value;
      const campo: { nomechave: string; valorchave: string } = {
        nomechave: this.questionarioEnum.QUESTIONARIO_EMPRESA_ENDERECO_ENTREGA,
        valorchave: this.empresas.controls[index].get(this.questionarioEnum.QUESTIONARIO_EMPRESA_ENDERECO).value,
      };
      payload.questionarioRespostas.push(campo);
    }
    for (let i = 0; i < this.empresas.controls.length; i++) {
      const empresa = this.empresas.controls[i] as FormGroup;
      if (empresa.get('active').value) {
        for (const key in empresa.controls) {
          if (key !== 'active') {
            const campo = {
              nomechave: key,
              valorchave: empresa.get(key).value,
              ordemChave: i,
            };
            payload.questionarioRespostas.push(campo);
          }
        }
      }
    }
    this.questionarioService.sendQuestionarioStep(2, payload).subscribe(() => {
      this.questionarioService.setActiveStep(this.questionarioService.activeTab$.value + 1);
    });
  }

  onUploadFile(file: any, btnId: string, ordem: number): void {
    if (file) {
      // Regex para pegar o conteúdo a partir do ultimo ponto "."
      const regex = /\.(?:.(?!\.))+$/gm;

      // Aplicando os resultados separados para cada propriedade
      this.files[ordem - 1].fileName = file.name.split(regex)[0];
      this.files[ordem - 1].fileExtension = file.name.match(regex)[0];

      this.isLoading = { btnId, status: true };
      this.questionarioService
        .uploadFile(file, this.idProjeto, this.idQuestionario, this.questionarioUploadType.UPLOAD_CNPJ, ordem)
        .pipe(
          finalize(() => {
            this.isLoading = { btnId: '', status: false };
          }),
          catchAndThrow(() => {
            this.fileUploadError = true;
          })
        )
        .subscribe(() => {
          this.fileUploadError = false;
          const controle = this.empresas.at(ordem - 1);
          controle
            .get(this.questionarioEnum.QUESTIONARIO_EMPRESA_CNPJ)
            .setValue(this.files[ordem - 1].fileName + '.' + this.files[ordem - 1].fileExtension);
        });
    }
  }

  backTabQuestionario(): void {
    this.questionarioService.setActiveStep(this.questionarioService.activeTab$.value - 1);
  }
}
