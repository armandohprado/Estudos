import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { RFI } from '../../models/rfi';
import { RfiService } from './rfi.service';
import { RouteParamEnum } from '../../models/route-param.enum';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RfiResolver implements Resolve<RFI[]> {
  constructor(private rfiService: RfiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RFI[]> | Promise<RFI[]> | RFI[] {
    const idOrcamentoChangeOrder = route.paramMap.has(RouteParamEnum.idOrcamentoChangeOrder)
      ? +route.paramMap.get(RouteParamEnum.idOrcamentoChangeOrder)
      : null;
    return this.rfiService.findByProjeto(+route.paramMap.get(RouteParamEnum.idProjeto), idOrcamentoChangeOrder);
  }
}
