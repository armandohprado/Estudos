import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CcCabecalhoStore } from './cc-cabecalho.store';
import { tap } from 'rxjs/operators';
import { CnCabecalho } from '../../../models/cn-cabecalho';
import { setLoading } from '@datorama/akita';

@Injectable({ providedIn: 'root' })
export class CcCabecalhoService {
  constructor(
    private http: HttpClient,
    private ccCabecalhoStore: CcCabecalhoStore
  ) {}

  private target =
    environment.AwApiUrl + 'compras-negociacao/orcamento-cenarios';

  getCabecalho(idOrcamentoCenario: number): Observable<CnCabecalho> {
    return this.http
      .get<CnCabecalho>(`${this.target}/${idOrcamentoCenario}`)
      .pipe(
        setLoading(this.ccCabecalhoStore),
        tap(cabecalho => {
          this.ccCabecalhoStore.update(cabecalho);
        })
      );
  }
}
