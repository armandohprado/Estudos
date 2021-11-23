import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CronogramaItemAtualizarPayload, Cronogramas } from '@aw-models/cronogramas';
import { map } from 'rxjs/operators';
import { mapCheckLists, mapCronogramas } from './util';
import { CheckListStatus } from '@aw-models/check-list-status';
import { environment } from '@aw-environments/environment';
import {
  CheckListNivelItem,
  CheckListNivelItemAddPayload,
  CheckListNivelItemAtualizarPayload,
  CheckLists,
} from '@aw-models/check-list';
import { ProjetoCronograma } from '@aw-models/projeto-cronograma';
import { AwHttpParams } from '@aw-utils/aw-http-params';

@Injectable({ providedIn: 'root' })
export class CheckListIntegradoService {
  constructor(private http: HttpClient) {}

  private _target = environment.api + 'checklist';

  getCronogramas(idProjeto: number): Observable<Cronogramas> {
    return this.http.get<Cronogramas>(`${this._target}/projeto/${idProjeto}/cronograma`).pipe(map(mapCronogramas));
  }

  getStatus(): Observable<CheckListStatus[]> {
    return this.http.get<CheckListStatus[]>(`${this._target}/status`);
  }

  putCronogramaItem(payload: CronogramaItemAtualizarPayload): Observable<void> {
    return this.http.put<void>(`${this._target}/cronograma-item`, payload);
  }

  getCheckLists(idProjeto: number, idProjetoCheckListIntegrado: number): Observable<CheckLists> {
    return this.http
      .get<CheckLists>(`${this._target}/projeto/${idProjeto}/projeto-checklist/${idProjetoCheckListIntegrado}`)
      .pipe(map(mapCheckLists));
  }

  putCheckListItem(payload: CheckListNivelItemAtualizarPayload): Observable<void> {
    return this.http.put<void>(`${this._target}/item`, payload);
  }

  postCheckListItem(payload: CheckListNivelItemAddPayload): Observable<CheckListNivelItem> {
    return this.http.post<CheckListNivelItem>(`${this._target}/item`, payload);
  }

  deleteCheckListItem(idProjetoCheckListIntegradoNivelItem: number): Observable<void> {
    return this.http.delete<void>(`${this._target}/${idProjetoCheckListIntegradoNivelItem}`);
  }

  pesquisarCronogramas(termo: string): Observable<ProjetoCronograma[]> {
    const params = new AwHttpParams({ termo });
    return this.http.get<ProjetoCronograma[]>(`${this._target}/cronograma`, { params });
  }

  atualizarCronogramaPublicado(idProjeto: number, publicado: boolean): Observable<void> {
    const headers = new HttpHeaders({ accept: 'application/json', 'content-type': 'application/json-patch+json' });
    return this.http.put<void>(`${this._target}/projeto/${idProjeto}/cronograma`, publicado, { headers });
  }

  atualizarCheckList(idProjetoCheckListIntegrado: number, informacaoEmail: string): Observable<void> {
    return this.http.put<void>(`${this._target}`, { idProjetoCheckListIntegrado, informacaoEmail });
  }
}
