import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';
import { Spread } from '@grapecity/spread-sheets';
import { environment } from '../../../environments/environment';
import { ChaveRegistroEnum } from '@aw-services/chave-registro/chave-registro.enum';

@Injectable({ providedIn: 'root' })
export class ChaveRegistroService {
  constructor(private http: HttpClient) {}

  private _target = environment.ApiChaveRegistroUrl;

  getKey(key: ChaveRegistroEnum): Observable<string> {
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
