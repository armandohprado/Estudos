import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ChangeOrderHeader } from './models/change-order-header';
import { ChangeOrderService } from './services/change-order.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class ChangeOrderHeaderResolver implements Resolve<ChangeOrderHeader> {
  constructor(private changeOrderService: ChangeOrderService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ChangeOrderHeader> | Promise<ChangeOrderHeader> | ChangeOrderHeader {
    const idOrcamentoCenario = +(route.paramMap.get(RouteParamEnum.idOrcamentoCenario) ?? 0);
    return this.changeOrderService.getHeaderChangeOrder(idOrcamentoCenario);
  }
}
