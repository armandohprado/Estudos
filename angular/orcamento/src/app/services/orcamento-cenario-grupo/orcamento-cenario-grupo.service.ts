import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrcamentoCenarioGrupoService {
  constructor(private http: HttpClient) {}

  target = environment.AwApiUrl + 'orcamento-cenario-grupo';

  // TODO criar model
  excluir(idOrcamentoCenarioGrupo: number): Observable<any> {
    return this.http.put<void>(`${this.target}/${idOrcamentoCenarioGrupo}/excluir`, undefined);
  }
}
