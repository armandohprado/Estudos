import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@aw-environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { mapCurvaFinanceira, mapDataCurvaFinanceira } from '../util';
import { CliFuncao } from '@aw-models/funcao';
import {
  CurvaFinanceira,
  CurvaFinanceiraPeriodoAtualizarPayload,
  DataCurvaFinanceira,
} from '@aw-models/curva-financeira';

@Injectable({ providedIn: 'root' })
export class CliCurvaFinanceiraService {
  constructor(private http: HttpClient) {}

  private _target = environment.api + '/projetos';

  get(idProjeto: number, funcao: CliFuncao): Observable<CurvaFinanceira[]> {
    return this.http.get<CurvaFinanceira[]>(`${this._target}/${idProjeto}/curva-financeira`).pipe(
      map(curvaFinanceiras =>
        curvaFinanceiras.map(curvaFinanceira => ({ ...curvaFinanceira, _funcao: funcao, idProjeto }))
      ),
      map(mapCurvaFinanceira)
    );
  }

  getMedicao(idProjeto: number, idMedicaoOrigem: number): Observable<DataCurvaFinanceira> {
    return this.http
      .get<DataCurvaFinanceira>(`${this._target}/${idProjeto}/curva-financeira/${idMedicaoOrigem}`)
      .pipe(map(mapDataCurvaFinanceira));
  }

  liberarEdicao(idObraCurvaFinanceira: number): Observable<void> {
    return this.http.put<void>(`${this._target}/curva-financeira/${idObraCurvaFinanceira}/liberar-edicao`, undefined);
  }

  put(payload: CurvaFinanceiraPeriodoAtualizarPayload): Observable<CurvaFinanceiraPeriodoAtualizarPayload> {
    return this.http.put<CurvaFinanceiraPeriodoAtualizarPayload>(`${this._target}/curva-financeira`, payload);
  }

  publicar(idObraCurvaFinanceira: number): Observable<void> {
    return this.http.put<void>(`${this._target}/curva-financeira/${idObraCurvaFinanceira}`, undefined);
  }

  congelar(idObraCurvaFinanceira: number): Observable<void> {
    return this.http.put<void>(`${this._target}/curva-financeira/${idObraCurvaFinanceira}/congelar`, undefined);
  }
}
