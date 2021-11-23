import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ChangeOrder } from './models/change-order';
import { Observable } from 'rxjs';
import { ChangeOrderService } from './services/change-order.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class ChangeOrderResolver implements Resolve<ChangeOrder[]> {
  constructor(private changeOrderService: ChangeOrderService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ChangeOrder[]> | Promise<ChangeOrder[]> | ChangeOrder[] {
    return this.changeOrderService.getChangeOrdersLista(+route.paramMap.get(RouteParamEnum.idOrcamento));
  }
}
