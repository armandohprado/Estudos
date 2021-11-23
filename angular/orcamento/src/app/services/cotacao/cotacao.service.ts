import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Proposta, PropostaHistorico } from '../../models';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isFunction } from 'lodash-es';
import { PropostaComercial } from '@aw-models/PropostaComercial';
import { orderByOperator } from '@aw-components/aw-utils/aw-order-by/aw-order-by';

@Injectable({
  providedIn: 'root',
})
export class CotacaoService {
  constructor(private http: HttpClient) {}

  private readonly _collapsesCotacao = new Map<number, Record<string, boolean>>();

  readonly targets = {
    orcamentos: `${environment.ApiUrl}orcamentos`,
    patchGroupComment: `${environment.ApiUrl}orcamentos/`,
  };

  getCotacaoCollapse(idOrcamentoCenario: number): Record<string, boolean> {
    let collapses = this._collapsesCotacao.get(idOrcamentoCenario);
    if (!collapses) {
      collapses = {};
      this._collapsesCotacao.set(idOrcamentoCenario, collapses);
    }
    return collapses;
  }

  updateStateCollapses(
    idOrcamentoCenario: number,
    partial: Record<string, boolean> | ((state: Record<string, boolean>) => Record<string, boolean>)
  ): void {
    const callback = isFunction(partial) ? partial : (value: Record<string, boolean>) => ({ ...value, ...partial });
    const collapses = this._collapsesCotacao.get(idOrcamentoCenario) ?? {};
    this._collapsesCotacao.set(idOrcamentoCenario, callback(collapses));
  }

  getPropostaHistoricos(idOrcamento: number, idGrupo: number, idProposta: number): Observable<PropostaHistorico[]> {
    return this.http
      .get<PropostaHistorico[]>(
        `${this.targets.orcamentos}/${idOrcamento}/grupos/${idGrupo}/propostas/${idProposta}/historicos`
      )
      .pipe(orderByOperator('versaoProposta', 'desc'));
  }

  toggleProposta(idOrcamento: number, idGrupoOrcamento: number, idProposta: number, status: boolean): Observable<any> {
    const target = `${environment.ApiUrl}orcamentos/proposta-desativada`;
    const obj = {
      idProposta,
      desativa: status,
    };
    return this.http.put(target, obj);
  }

  saveComentario(
    payload: { comentarioGrupo?: string; complementoGrupo?: string; exibeComentarioPropostaGrupo?: boolean },
    idOrcamentoGrupo: number,
    idOrcamento: number,
    customizada?
  ): Observable<any> {
    const target = `${this.targets.patchGroupComment}${idOrcamento}/grupos/${idOrcamentoGrupo}`;
    let params = new HttpParams();
    if (customizada) {
      params = params.set('customizada', customizada);
    }

    return this.http.patch(target, payload, { params });
  }

  createProposta(idOrcamento: number, idOrcamentoGrupo: number, customizada?: boolean): Observable<Proposta[]> {
    let params = new HttpParams();
    if (customizada) {
      params = params.set('customizada', customizada);
    }
    return this.http.post<Proposta[]>(
      `${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${idOrcamentoGrupo}/propostas`,
      {},
      { params }
    );
  }

  getPropostaComercialFiles(idOrcamento: number, idGrupo: number, idProposta: number): Observable<PropostaComercial[]> {
    return this.http
      .get<PropostaComercial[]>(
        `${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${idGrupo}/propostas/${idProposta}/arquivos`
      )
      .pipe(orderByOperator('idPropostaComercial', 'desc'));
  }

  sendPropostaComercialFile(
    idOrcamento: number,
    idGrupo: number,
    idProposta: number,
    fileList: FileList
  ): Observable<PropostaComercial[]> {
    const formData = new FormData();
    const file = fileList[0];
    formData.append('file', file);
    const headers = new HttpHeaders({ 'Content-Disposition': 'multipart/form-data' });
    return this.http
      .post<PropostaComercial[]>(
        `${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${idGrupo}/propostas/${idProposta}/uploads`,
        formData,
        { headers }
      )
      .pipe(orderByOperator('idPropostaComercial', 'desc'));
  }

  downloadFile(
    idOrcamento: number,
    idGrupo: number,
    idProposta: number,
    fileName: string
  ): Observable<{ data: string }> {
    return this.http.get<{ data: string }>(
      `${environment.downloadUrl}orcamentos/${idOrcamento}/grupos/${idGrupo}/propostas/${idProposta}/downloads/${fileName}`
    );
  }

  saveLastCall(idProposta: number, status: boolean): Observable<void> {
    const payload = {
      idProposta,
      desativa: status,
    };
    return this.http.put<void>(`${environment.ApiUrl}orcamentos/proposta-lastcall`, payload);
  }
}
