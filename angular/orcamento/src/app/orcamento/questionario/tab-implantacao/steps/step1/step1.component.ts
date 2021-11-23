import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  Projeto,
  QuestionarioImplantacaoByStep,
  QuestionarioImplantacaoStep1,
  QuestionarioModelo,
} from '../../../../../models';
import { QuestionarioService } from '../../../../../services/projeto/questionario.service';

@Component({
  selector: 'app-step1-implantacao',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
})
export class Step1ImplantacaoComponent implements OnInit, OnChanges {
  projeto: Projeto = this.route.snapshot.data.projeto;

  formImplantacaoStep1: FormGroup;
  interlocutoresGroup: FormArray;
  fornecedoresExcluidosGroup: FormArray;
  fornecedoresRecomendadosGroup: FormArray;

  QuestionarioEnum = QuestionarioImplantacaoStep1;
  questionarioModelo = QuestionarioModelo;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private questionarioService: QuestionarioService
  ) {
    this.formImplantacaoStep1 = this.fb.group({
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_OBJETIVO_FORMULARIO]: null,
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INFO_NOME_PROFISSIONAL]: new FormControl({
        value: '',
        disabled: false,
      }),
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_FORNECIDA_PELO_CLIENTE]: false,
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR_PREMISSA]: null,
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR]: null,
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR_PREMISSA]: null,
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR]: null,
      interlocutoresGroup: this.fb.array([this.createInterlocutor()]),
      fornecedoresExcluidosGroup: this.fb.array([this.createFornecedorExcluido()]),
      fornecedoresRecomendadosGroup: this.fb.array([this.createFornecedorRecomendado()]),
    });
  }

  @Input() formParent: QuestionarioImplantacaoByStep;
  @Output() changeTab = new EventEmitter<number>();

  ngOnChanges(): void {
    if (this.formParent) {
      this.formImplantacaoStep1.patchValue(this.formParent.passos.passo1);

      for (let i = 1; i < this.formParent.passos.passo1.interlocutoresGroup.length; i++) {
        this.addInterlocutor();
      }

      for (let i = 1; i < this.formParent.passos.passo1.fornecedoresExcluidosGroup.length; i++) {
        this.addFornecedorExcluido();
      }

      for (let i = 1; i < this.formParent.passos.passo1.fornecedoresRecomendadosGroup.length; i++) {
        this.addFornecedorRecomendado();
      }

      this.interlocutoresGroup = this.formImplantacaoStep1.get('interlocutoresGroup') as FormArray;
      this.fornecedoresExcluidosGroup = this.formImplantacaoStep1.get('fornecedoresExcluidosGroup') as FormArray;
      this.fornecedoresRecomendadosGroup = this.formImplantacaoStep1.get('fornecedoresRecomendadosGroup') as FormArray;
    }
  }

  ngOnInit(): void {}

  addInterlocutor(): void {
    this.interlocutoresGroup.push(this.createInterlocutor());
  }

  createInterlocutor(): FormGroup {
    return this.fb.group({
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_NOME]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_CARGO]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_EMAIL]: [''],
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_PHONE]: [''],
    });
  }

  get interlocutores(): FormArray {
    return this.formImplantacaoStep1.get('interlocutoresGroup') as FormArray;
  }

  addFornecedorExcluido(): void {
    this.fornecedoresExcluidosGroup.push(this.createFornecedorExcluido());
  }

  createFornecedorExcluido(): FormGroup {
    return this.fb.group({
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR_NOME]: [''],
    });
  }

  get fornecedoresExcluidos(): FormArray {
    return this.formImplantacaoStep1.get('fornecedoresExcluidosGroup') as FormArray;
  }

  addFornecedorRecomendado(): void {
    this.fornecedoresRecomendadosGroup.push(this.createFornecedorRecomendado());
  }

  createFornecedorRecomendado(): FormGroup {
    return this.fb.group({
      [this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR_NOME]: [''],
    });
  }

  sendForm(): void {
    const payload = {
      idQuestionario: this.formParent && this.formParent.idQuestionario ? this.formParent.idQuestionario : 0,
      idQuestionarioModelo: this.questionarioModelo.IMPLANTACAO,
      idProjeto: this.projeto.idProjeto,
      questionarioRespostas: [
        {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_OBJETIVO_FORMULARIO,
          valorchave: this.formImplantacaoStep1.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_OBJETIVO_FORMULARIO)
            .value,
        },
        {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_FORNECIDA_PELO_CLIENTE,
          valorchave: this.formImplantacaoStep1.get(
            this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_FORNECIDA_PELO_CLIENTE
          ).value,
        },
        {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR_PREMISSA,
          valorchave: this.formImplantacaoStep1.get(
            this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR_PREMISSA
          ).value,
        },
        {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR,
          valorchave: this.formImplantacaoStep1.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR)
            .value,
        },
        {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR_PREMISSA,
          valorchave: this.formImplantacaoStep1.get(
            this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR_PREMISSA
          ).value,
        },
        {
          nomechave: this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR,
          valorchave: this.formImplantacaoStep1.get(
            this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR
          ).value,
        },
      ],
    };

    if (this.formImplantacaoStep1.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_FORNECIDA_PELO_CLIENTE).value) {
      const interlocutores = (this.formImplantacaoStep1.get('interlocutoresGroup') as FormArray).controls;

      interlocutores.forEach((item, index) => {
        const name = this.setFieldValues(
          this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_NOME,
          item.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_NOME).value,
          index
        );
        payload.questionarioRespostas.push(name);

        const email = this.setFieldValues(
          this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_EMAIL,
          item.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_EMAIL).value,
          index
        );
        payload.questionarioRespostas.push(email);

        const cargo = this.setFieldValues(
          this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_CARGO,
          item.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_CARGO).value,
          index
        );
        payload.questionarioRespostas.push(cargo);

        const phone = this.setFieldValues(
          this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_PHONE,
          item.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_PHONE).value,
          index
        );
        payload.questionarioRespostas.push(phone);
      });
    } else {
      const nameProfissional = this.setFieldValues(
        this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INFO_NOME_PROFISSIONAL,
        this.formImplantacaoStep1.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_INFO_NOME_PROFISSIONAL).value
      );
      payload.questionarioRespostas.push(nameProfissional);
    }

    if (this.formImplantacaoStep1.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR).value) {
      const fornecedoresExcluidos = (this.formImplantacaoStep1.get('fornecedoresExcluidosGroup') as FormArray).controls;

      fornecedoresExcluidos.forEach((item, index) => {
        const name = this.setFieldValues(
          this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR_NOME,
          item.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR_NOME).value,
          index
        );
        payload.questionarioRespostas.push(name);
      });
    }

    if (this.formImplantacaoStep1.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR).value) {
      const fornecedoresRecomendados = (this.formImplantacaoStep1.get('fornecedoresRecomendadosGroup') as FormArray)
        .controls;

      fornecedoresRecomendados.forEach((item, index) => {
        const name = this.setFieldValues(
          this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR_NOME,
          item.get(this.QuestionarioEnum.QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR_NOME).value,
          index
        );
        payload.questionarioRespostas.push(name);
      });
    }

    this.questionarioService.sendQuestionarioStep(this.questionarioModelo.IMPLANTACAO, payload).subscribe(() => {
      this.changeTab.emit(2);
    });
  }

  setFieldValues(nomechave, valorchave, ordemChave?): any {
    return {
      nomechave,
      valorchave,
      ordemChave,
    };
  }

  removeFormItem(index: number, formSource: string): void {
    const payload = {
      idQuestionario: this.formParent.idQuestionario,
      idQuestionarioModelo: this.questionarioModelo.IMPLANTACAO,
      idProjeto: this.projeto.idProjeto,
      questionarioRespostas: [],
    };

    const formItem = this[formSource].controls[index].controls;

    for (const item of Object.keys(formItem)) {
      payload.questionarioRespostas.push({
        nomechave: item,
        ordemChave: index,
        valorchave: '',
      });
    }

    this.questionarioService.deleteField(payload).subscribe(() => {
      this[formSource].controls.splice(index, 1);
    });
  }
}
