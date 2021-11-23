import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@aw-environments/environment';
import { Observable } from 'rxjs';
import { ObraFase, ObraFasePeriodo, ObraFasePeriodoAtualizarPayload } from '@aw-models/obra-fase';
import { map } from 'rxjs/operators';
import { mapObraFases } from '../util';

@Injectable({ providedIn: 'root' })
export class CliObraFaseService {
  constructor(private http: HttpClient) {}

  private _target = environment.api + '/projetos';

  get(idProjeto: number): Observable<ObraFase[]> {
    return this.http.get<ObraFase[]>(`${this._target}/${idProjeto}/obra-fases`).pipe(map(mapObraFases));
  }

  liberarEdicao(idObraFase: number): Observable<void> {
    return this.http.put<void>(`${this._target}/obra-fases/${idObraFase}/liberar-edicao`, undefined);
  }

  put(payload: ObraFasePeriodoAtualizarPayload): Observable<ObraFasePeriodo> {
    return this.http.put<ObraFasePeriodo>(`${this._target}/obra-fase-periodos`, payload);
  }

  publicar(idObraFase: number): Observable<void> {
    return this.http.put<void>(`${this._target}/obra-fases/${idObraFase}`, undefined);
  }
}
