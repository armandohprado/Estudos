import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ControleFichaContrato, ControleFicha } from './models/fichas';
import { FichaService } from './service/ficha.service';

@Injectable({ providedIn: 'root' })
export class ControleFichaResolver implements Resolve<[ControleFicha[], ControleFichaContrato[]]> {
  constructor(private fichaService: FichaService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<[ControleFicha[], ControleFichaContrato[]]>
    | Promise<[ControleFicha[], ControleFichaContrato[]]>
    | [ControleFicha[], ControleFichaContrato[]] {
    const contratos = this.fichaService.getContratos(+route.paramMap.get(RouteParamEnum.idOrcamento));
    const lista = this.fichaService.getListaFichas(+route.paramMap.get(RouteParamEnum.idOrcamentoCenario));
    return forkJoin([lista, contratos]);
  }
}
