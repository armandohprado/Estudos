import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CnCabecalho } from '../../models/cn-cabecalho';
import { Observable } from 'rxjs';
import { CcCabecalhoService } from '../state/cabecalho/cc-cabecalho.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class CnCabecalhoResolver implements Resolve<CnCabecalho> {
  constructor(private ccCabecalhoService: CcCabecalhoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CnCabecalho> | Promise<CnCabecalho> | CnCabecalho {
    return this.ccCabecalhoService.getCabecalho(+route.paramMap.get(RouteParamEnum.idOrcamentoCenario));
  }
}
