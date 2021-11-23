import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Funcionario, FuncionarioIncluirPayload, Responsavel } from '../../models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrcamentoService } from './orcamento.service';
import { refresh } from '@aw-utils/rxjs/operators';
import { orderByOperator } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { AwHttpParams } from '@aw-utils/http-params';

@Injectable({
  providedIn: 'root',
})
export class ResponsavelService {
  constructor(private http: HttpClient, private orcamentoService: OrcamentoService) {}

  target = environment.AwApiUrl + 'orcamento-grupo-responsavel';

  getResponsaveis(
    idOrcamento: number,
    IdGrupo: number,
    busca?: string,
    tipoResponsavelEnum?: number
  ): Observable<Funcionario[]> {
    const params = new AwHttpParams({ tipoResponsavelEnum, busca }, true);

    return this.http
      .get<Funcionario[]>(`${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${IdGrupo}/possiveis-responsaveis`, {
        params,
      })
      .pipe(orderByOperator('nomeFantasia'));
  }

  saveResponsavel(
    idOrcamento: number,
    idOrcamentoCenario: number,
    responsavelData: FuncionarioIncluirPayload,
    selecionadoTodos?: boolean
  ): Observable<Funcionario> {
    let params = new HttpParams();
    if (selecionadoTodos) {
      params = params.set('selecionadoTodos', `${selecionadoTodos}`);
    }
    return this.http
      .post<Funcionario>(
        `${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${responsavelData.idGrupo}/responsaveis`,
        responsavelData,
        { params }
      )
      .pipe(refresh(this.orcamentoService.refreshOrcamento(idOrcamento, idOrcamentoCenario)));
  }

  deleteResponsavel(
    idOrcamento: number,
    idGrupo: number,
    idReponsavel: number,
    idOrcamentoCenario: number
  ): Observable<any> {
    return this.http
      .delete<Responsavel>(
        `${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${idGrupo}/responsaveis/${idReponsavel}`
      )
      .pipe(refresh(this.orcamentoService.refreshOrcamento(idOrcamento, idOrcamentoCenario)));
  }

  alterarResponsavel(
    idOrcamento: number,
    idOrcamentoCenario: number,
    idFuncionarioAtual: number,
    selecionarTodos: boolean,
    payload: FuncionarioIncluirPayload
  ): Observable<void> {
    const params = new AwHttpParams({ selecionarTodos });
    return this.http
      .put<void>(`${this.target}/${idOrcamento}/responsavel/${idFuncionarioAtual}`, payload, { params })
      .pipe(refresh(this.orcamentoService.refreshOrcamento(idOrcamento, idOrcamentoCenario)));
  }
}
