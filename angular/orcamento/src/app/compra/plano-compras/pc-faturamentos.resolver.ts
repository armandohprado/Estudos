import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { PcFaturamento } from './models/pc-faturamento';
import { Observable } from 'rxjs';
import { PlanoComprasService } from './state/plano-compras/plano-compras.service';

@Injectable({ providedIn: 'root' })
export class PcFaturamentosResolver implements Resolve<PcFaturamento[]> {
  constructor(private planoComprasService: PlanoComprasService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<PcFaturamento[]> | Promise<PcFaturamento[]> | PcFaturamento[] {
    return this.planoComprasService._faturamentos$.value?.length
      ? this.planoComprasService._faturamentos$.value
      : this.planoComprasService.getFaturamentos();
  }
}
