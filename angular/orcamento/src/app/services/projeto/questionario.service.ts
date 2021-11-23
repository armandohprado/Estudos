import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Questionario,
  QuestionarioImplantacaoStep1,
  QuestionarioImplantacaoStep2,
  QuestionarioImplantacaoStep3,
  QuestionarioImplantacaoStep4,
  QuestionarioImplantacaoStep5,
  QuestionarioImplantacaoStep6,
  QuestionarioResposta,
  QuestionarioStep1,
  QuestionarioStep2,
  QuestionarioStep3,
  QuestionarioStep4,
} from '../../models';
import { environment } from '../../../environments/environment';
import { isObject } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class QuestionarioService {
  questionarioStep1 = QuestionarioStep1;
  questionarioStep2 = QuestionarioStep2;
  questionarioStep3 = QuestionarioStep3;
  questionarioStep4 = QuestionarioStep4;

  questionarioImplantacaoStep1 = QuestionarioImplantacaoStep1;
  questionarioImplantacaoStep2 = QuestionarioImplantacaoStep2;
  questionarioImplantacaoStep3 = QuestionarioImplantacaoStep3;
  questionarioImplantacaoStep4 = QuestionarioImplantacaoStep4;
  questionarioImplantacaoStep5 = QuestionarioImplantacaoStep5;
  questionarioImplantacaoStep6 = QuestionarioImplantacaoStep6;

  targets = {
    baseUrl: `${environment.ApiUrl}projetos`,
  };

  // payload = {
  //   questionarioId: 0,
  //   questionarioModeloId: 0,
  //   projetoId: 0,
  //   questionariorespostas: [],
  // }

  questionario = {
    idQuestionario: 0,
    idQuestionarioModelo: 0,
    idProjeto: 0,
    passos: {
      passo1: {
        interlocutoresGroup: [],
      },
      passo2: {
        empresasGroup: [],
      },
      passo3: {},
      passo4: {},
    },
  };

  activeTab$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  questionarioImplantacao = {
    idQuestionario: 0,
    idQuestionarioModelo: 0,
    idProjeto: 0,
    passos: {
      passo1: {
        interlocutoresGroup: [],
        fornecedoresExcluidosGroup: [],
        fornecedoresRecomendadosGroup: [],
      },
      passo2: {},
      passo3: {},
      passo4: {},
      passo5: {},
      passo6: {},
    },
  };

  constructor(private http: HttpClient) {}

  getQuestionario(projetoId: number, modelo: number): Observable<Questionario> {
    return this.http.get<Questionario>(`${this.targets.baseUrl}/${projetoId}/questionarios/${modelo}`);
  }

  sendQuestionarioStep(step: number, questionario: Questionario): Observable<Questionario> {
    if (questionario.idQuestionario === 0) {
      return this.http.post<Questionario>(`${this.targets.baseUrl}/questionarios`, questionario);
    } else {
      const target = `${this.targets.baseUrl}/questionarios/${questionario.idQuestionario}`;
      return this.http.put<Questionario>(target, questionario);
    }
  }

  addFieldToPayload(campo, form): { nomeChave: string; valorChave: string } {
    return {
      nomeChave: campo,
      valorChave: form.get(campo).value,
    };
  }

  createField(nomeChave: string, valorChave: string): { nomeChave: string; valorChave: string } {
    return {
      nomeChave,
      valorChave,
    };
  }

  stripFields(data: Questionario): any {
    if (data) {
      this.questionario.idProjeto = data.idProjeto ? data.idProjeto : 0;
      this.questionario.idQuestionario = data.idQuestionario ? data.idQuestionario : 0;
      this.questionario.idQuestionarioModelo = data.idQuestionarioModelo ? data.idQuestionarioModelo : 1;

      for (const key of Object.keys(this.questionarioStep1)) {
        const campos: QuestionarioResposta[] = data.questionarioRespostas.filter(
          (field: QuestionarioResposta) => field.nomeChave === this.questionarioStep1[key]
        );

        if (campos.length > 0) {
          if (campos[0].nomeChave.includes('interlocutor')) {
            for (const campo of campos) {
              if (!isObject(this.questionario.passos.passo1.interlocutoresGroup[campo.ordemChave])) {
                this.questionario.passos.passo1.interlocutoresGroup[campo.ordemChave] = {};
              }
              this.questionario.passos.passo1.interlocutoresGroup[campo.ordemChave][this.questionarioStep1[key]] =
                campo.valorChave;
            }
          } else {
            if (key === 'QUESTIONARIO_TIPO') {
              this.questionario.passos.passo1[this.questionarioStep1[key]] = Number(campos[0].valorChave);
            } else {
              this.questionario.passos.passo1[this.questionarioStep1[key]] = campos[0].valorChave;
            }
          }
        } else {
          this.questionario.passos.passo1[this.questionarioStep1[key]] = '';
        }
      }

      for (const key of Object.keys(this.questionarioStep2)) {
        const campos: QuestionarioResposta[] = data.questionarioRespostas.filter(
          (field: QuestionarioResposta) => field.nomeChave === this.questionarioStep2[key]
        );
        if (campos.length > 0) {
          if (!campos[0].nomeChave.includes('entrega')) {
            for (const campo of campos) {
              if (!isObject(this.questionario.passos.passo2.empresasGroup[campo.ordemChave])) {
                this.questionario.passos.passo2.empresasGroup[campo.ordemChave] = {};
              }
              this.questionario.passos.passo2.empresasGroup[campo.ordemChave][this.questionarioStep2[key]] =
                campo.valorChave;
            }
          } else {
            this.questionario.passos.passo2[this.questionarioStep2[key]] = campos[0].valorChave;
          }
        } else {
          this.questionario.passos.passo2[this.questionarioStep2[key]] = '';
        }
      }
      for (const key of Object.keys(this.questionarioStep3)) {
        const campo: QuestionarioResposta = data.questionarioRespostas.find(
          (field: QuestionarioResposta) => field.nomeChave === this.questionarioStep3[key]
        );
        if (campo) {
          this.questionario.passos.passo3[this.questionarioStep3[key]] = campo.valorChave;
        } else {
          this.questionario.passos.passo3[this.questionarioStep3[key]] = '';
        }
      }
      for (const key of Object.keys(this.questionarioStep4)) {
        const campo: QuestionarioResposta = data.questionarioRespostas.find(
          (field: QuestionarioResposta) => field.nomeChave === this.questionarioStep4[key]
        );
        if (campo) {
          this.questionario.passos.passo4[this.questionarioStep4[key]] = campo.valorChave;
        } else {
          this.questionario.passos.passo4[this.questionarioStep4[key]] = '';
        }
      }
    }
    return this.questionario;
  }

  uploadFile(
    file: File,
    idProjeto: string | number,
    idQuestionario: string | number,
    chave: string,
    ordem = 0
  ): Observable<any> {
    const formData = new FormData();
    const headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');

    formData.append('file', file);
    return this.http.post<any>(
      `${this.targets.baseUrl}/${idProjeto}/questionarios/${idQuestionario}/file/${chave}/${ordem}`,
      formData,
      { headers }
    );
  }

  setActiveStep(step: number): void {
    this.activeTab$.next(step);
  }

  stripFieldsImplantacao(data: Questionario): any {
    if (!data) return this.questionarioImplantacao;

    this.questionarioImplantacao.idProjeto = data.idProjeto ? data.idProjeto : 0;
    this.questionarioImplantacao.idQuestionario = data.idQuestionario ? data.idQuestionario : 0;
    this.questionarioImplantacao.idQuestionarioModelo = data.idQuestionarioModelo ? data.idQuestionarioModelo : 2;

    for (const key of Object.keys(this.questionarioImplantacaoStep1)) {
      const campos: QuestionarioResposta[] = data.questionarioRespostas.filter(
        (field: QuestionarioResposta) => field.nomeChave === this.questionarioImplantacaoStep1[key]
      );

      if (campos.length > 0) {
        if (campos[0].nomeChave.includes('interlocutor')) {
          for (const campo of campos) {
            if (!isObject(this.questionarioImplantacao.passos.passo1.interlocutoresGroup[campo.ordemChave])) {
              this.questionarioImplantacao.passos.passo1.interlocutoresGroup[campo.ordemChave] = {};
            }
            this.questionarioImplantacao.passos.passo1.interlocutoresGroup[campo.ordemChave][
              this.questionarioImplantacaoStep1[key]
            ] = campo.valorChave;
          }
        } else if (campos[0].nomeChave.includes('excluir-fornecedor-nome')) {
          for (const campo of campos) {
            if (!isObject(this.questionarioImplantacao.passos.passo1.fornecedoresExcluidosGroup[campo.ordemChave])) {
              this.questionarioImplantacao.passos.passo1.fornecedoresExcluidosGroup[campo.ordemChave] = {};
            }

            this.questionarioImplantacao.passos.passo1.fornecedoresExcluidosGroup[campo.ordemChave][
              this.questionarioImplantacaoStep1[key]
            ] = campo.valorChave;
          }
        } else if (campos[0].nomeChave.includes('recomendar-fornecedor-nome')) {
          for (const campo of campos) {
            if (!isObject(this.questionarioImplantacao.passos.passo1.fornecedoresRecomendadosGroup[campo.ordemChave])) {
              this.questionarioImplantacao.passos.passo1.fornecedoresRecomendadosGroup[campo.ordemChave] = {};
            }
            this.questionarioImplantacao.passos.passo1.fornecedoresRecomendadosGroup[campo.ordemChave][
              this.questionarioImplantacaoStep1[key]
            ] = campo.valorChave;
          }
        } else {
          this.questionarioImplantacao.passos.passo1[this.questionarioImplantacaoStep1[key]] =
            campos[0].valorChave === 'true' || campos[0].valorChave === 'false'
              ? JSON.parse(campos[0].valorChave)
              : campos[0].valorChave;
        }
      } else {
        this.questionarioImplantacao.passos.passo1[this.questionarioImplantacaoStep1[key]] = '';
      }
    }

    for (const key of Object.keys(this.questionarioImplantacaoStep2)) {
      const campos: QuestionarioResposta[] = data.questionarioRespostas.filter(
        (field: QuestionarioResposta) => field.nomeChave === this.questionarioImplantacaoStep2[key]
      );

      if (campos.length) {
        this.questionarioImplantacao.passos.passo2[this.questionarioImplantacaoStep2[key]] =
          campos[0].valorChave === 'true' || campos[0].valorChave === 'false'
            ? JSON.parse(campos[0].valorChave)
            : campos[0].valorChave;
      } else {
        this.questionarioImplantacao.passos.passo2[this.questionarioImplantacaoStep2[key]] = '';
      }
    }

    for (const key of Object.keys(this.questionarioImplantacaoStep3)) {
      const campos: QuestionarioResposta[] = data.questionarioRespostas.filter(
        (field: QuestionarioResposta) => field.nomeChave === this.questionarioImplantacaoStep3[key]
      );

      if (campos.length) {
        this.questionarioImplantacao.passos.passo3[this.questionarioImplantacaoStep3[key]] =
          campos[0].valorChave === 'true' || campos[0].valorChave === 'false'
            ? JSON.parse(campos[0].valorChave)
            : campos[0].valorChave;
      } else {
        this.questionarioImplantacao.passos.passo3[this.questionarioImplantacaoStep3[key]] = '';
      }
    }

    for (const key of Object.keys(this.questionarioImplantacaoStep4)) {
      const campos: QuestionarioResposta[] = data.questionarioRespostas.filter(
        (field: QuestionarioResposta) => field.nomeChave === this.questionarioImplantacaoStep4[key]
      );

      if (campos.length) {
        this.questionarioImplantacao.passos.passo4[this.questionarioImplantacaoStep4[key]] =
          campos[0].valorChave === 'true' || campos[0].valorChave === 'false'
            ? JSON.parse(campos[0].valorChave)
            : campos[0].valorChave;
      } else {
        this.questionarioImplantacao.passos.passo4[this.questionarioImplantacaoStep4[key]] = '';
      }
    }

    for (const key of Object.keys(this.questionarioImplantacaoStep5)) {
      const campos: QuestionarioResposta[] = data.questionarioRespostas.filter(
        (field: QuestionarioResposta) => field.nomeChave === this.questionarioImplantacaoStep5[key]
      );

      if (campos.length) {
        this.questionarioImplantacao.passos.passo5[this.questionarioImplantacaoStep5[key]] =
          campos[0].valorChave === 'true' || campos[0].valorChave === 'false'
            ? JSON.parse(campos[0].valorChave)
            : campos[0].valorChave;
      } else {
        this.questionarioImplantacao.passos.passo5[this.questionarioImplantacaoStep5[key]] = '';
      }
    }

    for (const key of Object.keys(this.questionarioImplantacaoStep6)) {
      const campos: QuestionarioResposta[] = data.questionarioRespostas.filter(
        (field: QuestionarioResposta) => field.nomeChave === this.questionarioImplantacaoStep6[key]
      );

      if (campos.length) {
        this.questionarioImplantacao.passos.passo6[this.questionarioImplantacaoStep6[key]] =
          campos[0].valorChave === 'true' || campos[0].valorChave === 'false'
            ? JSON.parse(campos[0].valorChave)
            : campos[0].valorChave;
      } else {
        this.questionarioImplantacao.passos.passo6[this.questionarioImplantacaoStep6[key]] = '';
      }
    }

    return this.questionarioImplantacao;
  }

  deleteField(payload: Questionario): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: payload,
    };
    return this.http.delete(`${this.targets.baseUrl}/questionarios`, httpOptions);
  }
}
