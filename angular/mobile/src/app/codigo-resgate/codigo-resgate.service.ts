import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@aw-environments/environment';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AwMobileService {
  constructor(private httpClient: HttpClient) {}

  target = `${environment.api}/codigo-resgate`;
  mensagemErroCodResgate$ = new BehaviorSubject<string>('');

  post(payload: { celular: string }): Observable<any> {
    return this.httpClient.post(`${this.target}`, payload);
  }

  getCodigoResgate(idCodigoResgate: string, sistemaOperacional: SistemaOperacionalEnum): Observable<{ url: string }> {
    return this.httpClient.get<{ url: string }>(`${this.target}/${idCodigoResgate}/so/${sistemaOperacional}`).pipe(
      catchError(err => {
        this.mensagemErroCodResgate$.next(err?.error?.erros?.[0]?.mensagem ?? 'Erro interno');
        return throwError(() => err);
      })
    );
  }
}

export enum SistemaOperacionalEnum {
  android = 1,
  ios,
}
