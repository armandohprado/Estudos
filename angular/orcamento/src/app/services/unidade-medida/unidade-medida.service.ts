import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UnidadeMedida } from '../../models/unidade-medida';
import { UnidadeMedidaQuery } from './unidade-medida.query';
import { UnidadeMedidaStore } from './unidade-medida.store';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UnidadeMedidaService {
  constructor(
    private http: HttpClient,
    private unidadeMedidasQuery: UnidadeMedidaQuery,
    private unidadeMedidasStore: UnidadeMedidaStore
  ) {}

  target = `${environment.AwApiUrl}/unidade-medidas`;

  getUnidadeMedidas(): Observable<UnidadeMedida[]> {
    const request$ = this.http.get<UnidadeMedida[]>(this.target).pipe(
      tap(unidadeMedidadas => {
        this.unidadeMedidasStore.set(unidadeMedidadas);
      })
    );
    const ums = this.unidadeMedidasQuery.getAll();
    if (ums?.length) {
      return of(ums);
    } else {
      return request$;
    }
  }
}
