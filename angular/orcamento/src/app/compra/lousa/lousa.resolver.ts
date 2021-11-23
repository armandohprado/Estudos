import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { LousaCabecalho } from '../models/lousa-cabecalho';
import { LousaService } from './lousa.service';
import { LousaGrupo } from '../models/lousa-grupo';

@Injectable({ providedIn: 'root' })
export class LousaResolver implements Resolve<[LousaCabecalho[], LousaGrupo[]]> {
  constructor(private lousaService: LousaService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<[LousaCabecalho[], LousaGrupo[]]>
    | Promise<[LousaCabecalho[], LousaGrupo[]]>
    | [LousaCabecalho[], LousaGrupo[]] {
    const cabecalho = this.lousaService.getCabecalhos(+route.paramMap.get(RouteParamEnum.idOrcamentoCenario));
    const lista = this.lousaService.getGrupos(+route.paramMap.get(RouteParamEnum.idOrcamentoCenario));
    return forkJoin([cabecalho, lista]);
  }
}
