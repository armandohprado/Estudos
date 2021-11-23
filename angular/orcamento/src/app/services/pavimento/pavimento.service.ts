import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PavimentoInfo } from '../../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PavimentoService {
  constructor(private http: HttpClient) {}

  target = environment.AwApiUrl + 'pavimentos';

  getInfo(idProjetoEdificioPavimento: number): Observable<PavimentoInfo> {
    return this.http.get<PavimentoInfo>(`${this.target}/${idProjetoEdificioPavimento}/informacoes`);
  }

  updateInfo(idProjetoEdificioPavimento: number, info: PavimentoInfo): Observable<PavimentoInfo> {
    return this.http.put<PavimentoInfo>(`${this.target}/${idProjetoEdificioPavimento}/informacoes`, info);
  }
}
