import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { PlanoCompras } from './models/plano-compras';
import { PlanoComprasService } from './state/plano-compras/plano-compras.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '../../models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class PcListaResolver implements Resolve<PlanoCompras[]> {
  constructor(private planoComprasService: PlanoComprasService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<PlanoCompras[]> | Promise<PlanoCompras[]> | PlanoCompras[] {
    return this.planoComprasService.getLista(+route.paramMap.get(RouteParamEnum.idOrcamentoCenario));
  }
}
