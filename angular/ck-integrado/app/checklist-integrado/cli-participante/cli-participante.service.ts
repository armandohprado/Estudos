import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckListParticipante, CheckListParticipanteAdicionarPayload } from '@aw-models/check-list-participante';
import { environment } from '@aw-environments/environment';
import { map } from 'rxjs/operators';
import { mapParticipantes } from '../util';

@Injectable({ providedIn: 'root' })
export class CliParticipanteService {
  constructor(private http: HttpClient) {}

  private _target = environment.api + 'participantes';

  get(idProjeto: number, idProjetoCheckListIntegrado: number): Observable<CheckListParticipante[]> {
    return this.http
      .get<CheckListParticipante[]>(
        `${this._target}/projeto/${idProjeto}/projeto-checklist/${idProjetoCheckListIntegrado}`
      )
      .pipe(map(mapParticipantes));
  }

  post(payload: CheckListParticipanteAdicionarPayload): Observable<CheckListParticipante> {
    return this.http.post<CheckListParticipante>(`${this._target}`, payload);
  }

  delete(idCheckListParticipante: number): Observable<void> {
    return this.http.delete<void>(`${this._target}/${idCheckListParticipante}`);
  }

  put(idCheckListParticipante: number, idCheckListParticipanteStatus: number): Observable<void> {
    return this.http.put<void>(`${this._target}/${idCheckListParticipante}`, idCheckListParticipanteStatus);
  }
}
