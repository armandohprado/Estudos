import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Familia } from '@aw-models/index';
import { Observable } from 'rxjs';
import { ChangeOrderFamiliaService } from '../state/familia/change-order-familia.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class ChangeOrderFamiliasResolver implements Resolve<Familia[]> {
  constructor(private changeOrderFamiliaService: ChangeOrderFamiliaService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Familia[]> | Promise<Familia[]> | Familia[] {
    const idOrcamentoChangeOrder = route.paramMap.get(RouteParamEnum.idOrcamentoChangeOrder);
    return this.changeOrderFamiliaService.getFamilias(idOrcamentoChangeOrder ? +idOrcamentoChangeOrder : null);
  }
}
