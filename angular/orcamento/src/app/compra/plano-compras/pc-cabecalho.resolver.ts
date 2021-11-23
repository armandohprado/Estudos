import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { PcCabecalho } from './models/pc-cabecalho';
import { Observable } from 'rxjs';
import { PcCabecalhoService } from './state/cabecalho/pc-cabecalho.service';
import { RouteParamEnum } from '../../models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class PcCabecalhoResolver implements Resolve<PcCabecalho> {
  constructor(private pcCabecalhoService: PcCabecalhoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<PcCabecalho> | Promise<PcCabecalho> | PcCabecalho {
    return this.pcCabecalhoService.getCabecalho(+route.paramMap.get(RouteParamEnum.idOrcamentoCenario));
  }
}
