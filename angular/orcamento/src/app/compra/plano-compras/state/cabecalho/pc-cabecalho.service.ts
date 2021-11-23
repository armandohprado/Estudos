import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PcCabecalhoStore } from './pc-cabecalho.store';
import { tap } from 'rxjs/operators';
import { PcCabecalho } from '../../models/pc-cabecalho';
import { setUndefinedToZeroObj } from '../../util/util';
import { environment } from '../../../../../environments/environment';
import { awCache } from '../../../../utils/akita/akita';
import { setLoading } from '@datorama/akita';
import { PcCabecalhoQuery } from './pc-cabecalho.query';

@Injectable({ providedIn: 'root' })
export class PcCabecalhoService {
  constructor(
    private http: HttpClient,
    public pcCabecalhoStore: PcCabecalhoStore,
    private pcCabecalhoQuery: PcCabecalhoQuery
  ) {}

  private lastIdOrcamentoCenario: number;

  private target = environment.AwApiUrl + 'planos-compra';
  targetCenario = (idOrcamentoCenario: number | string): string =>
    `${this.target}/orcamentos-cenario/${idOrcamentoCenario}`;

  getCabecalho(idOrcamentoCenario: number): Observable<PcCabecalho> {
    let $request = this.http.get<PcCabecalho>(`${this.targetCenario(idOrcamentoCenario)}/cabecalho`).pipe(
      setUndefinedToZeroObj(),
      tap(cabecalho => {
        this.pcCabecalhoStore.setHasCache(true, { restartTTL: true });
        this.pcCabecalhoStore.update(cabecalho);
        this.pcCabecalhoStore.setError(null);
      }),
      setLoading(this.pcCabecalhoStore)
    );
    if (this.lastIdOrcamentoCenario === idOrcamentoCenario) {
      $request = $request.pipe(awCache(this.pcCabecalhoQuery));
    } else {
      this.lastIdOrcamentoCenario = idOrcamentoCenario;
    }
    return $request;
  }

  update(partial: Partial<PcCabecalho>): void {
    this.pcCabecalhoStore.update(partial);
  }

  toggleMinified(): void {
    this.update({ minified: !this.pcCabecalhoStore.getValue().minified });
  }
}
