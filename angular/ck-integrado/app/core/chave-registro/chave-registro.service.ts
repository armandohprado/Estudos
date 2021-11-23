import { Injectable } from '@angular/core';
import { Spread } from '@grapecity/spread-sheets';
import { pluck, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ChaveRegistroEnum } from './chave-registro.enum';
import { environment } from '@aw-environments/environment';

@Injectable({ providedIn: 'root' })
export class ChaveRegistroService {
  constructor(private http: HttpClient) {}

  private _target = environment.apiChaveRegistro;

  getKey(key: ChaveRegistroEnum): Observable<string> {
    if (!environment.build) {
      return of('');
    }
    return this.http.get<{ chave: string }>(`${this._target}${key}`).pipe(pluck('chave'));
  }

  getSpreadjsKey(): Observable<string> {
    if (!Spread.Sheets.LicenseKey) {
      return this.getKey(ChaveRegistroEnum.spreadjs).pipe(
        tap(key => {
          Spread.Sheets.LicenseKey = key;
        })
      );
    } else {
      return of(Spread.Sheets.LicenseKey);
    }
  }
}
