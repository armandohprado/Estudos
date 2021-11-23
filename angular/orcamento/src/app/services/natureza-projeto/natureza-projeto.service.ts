import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { NaturezaProjeto } from '@aw-models/natureza-projeto';

@Injectable({ providedIn: 'root' })
export class NaturezaProjetoService {
  constructor(private http: HttpClient) {}

  private _target = environment.AwApiUrl + 'projetos/natureza';

  get(): Observable<NaturezaProjeto[]> {
    return this.http.get<NaturezaProjeto[]>(`${this._target}`);
  }
}
