import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { RFI } from '../../models/rfi';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { AwHttpParams } from '../../utils/http-params';

@Injectable({ providedIn: 'root' })
export class RfiService {
  constructor(private http: HttpClient) {}

  target = environment.AwApiUrl + 'rfi';

  private _all$ = new BehaviorSubject<RFI[]>([]);
  all$ = this._all$.asObservable();

  findByProjeto(idProjeto: number, idOrcamentoChangeOrder?: number): Observable<RFI[]> {
    const params = new AwHttpParams({ idOrcamentoChangeOrder }, true);
    return this.http
      .get<RFI[]>(`${this.target}/projeto/${idProjeto}`, { params })
      .pipe(
        tap(rfis => {
          this._all$.next(rfis);
        })
      );
  }
}
