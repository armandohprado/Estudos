import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AwHttpParams } from '@aw-utils/http-params';
import { ResponsavelAlt } from '@aw-models/responsavel';

@Injectable({ providedIn: 'root' })
export class OrcamentoGrupoResponsavelService {
  constructor(private http: HttpClient) {}

  private _target = environment.AwApiUrl + 'orcamento-grupo-responsavel';

  get(idOrcamento: number, idGrupo: number, compraNegociacao = false): Observable<ResponsavelAlt[]> {
    const params = new AwHttpParams({ compraNegociacao });
    return this.http.get<ResponsavelAlt[]>(`${this._target}/orcamentos/${idOrcamento}/grupos/${idGrupo}/responsaveis`, {
      params,
    });
  }
}
