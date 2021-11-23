import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { map } from 'rxjs/operators';
import { CenarioStatusEnum } from '../../models';
import { parseUrlFromGuard } from '@aw-utils/util';
import { PlanilhaVendasHibridaService } from './planilha-vendas-hibrida.service';

@Injectable({
  providedIn: 'root',
})
export class PlanilhaCongeladaGuard implements CanActivate {
  constructor(
    private router: Router,
    private cenariosService: CenariosService,
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.cenariosService.getStatus(+next.paramMap.get(RouteParamEnum.idOrcamentoCenario)).pipe(
      tap(idCenarioStatus => {
        this.planilhaVendasHibridaService.idCenarioStatus = idCenarioStatus;
      }),
      map(
        status =>
          status !== CenarioStatusEnum.congelado || this.router.createUrlTree([parseUrlFromGuard(state.url, '../../')])
      )
    );
  }
}
