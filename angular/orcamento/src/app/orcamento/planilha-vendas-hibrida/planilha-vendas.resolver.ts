import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Cenario } from './models/cenario';
import { PlanilhaVendasHibridaService } from './planilha-vendas-hibrida.service';
import { RouteParamEnum } from '../../models/route-param.enum';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlanilhaHibridaCenarioResolver implements Resolve<Cenario> {
  constructor(private planilhaVendasHibridaService: PlanilhaVendasHibridaService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Cenario> | Promise<Cenario> | Cenario {
    const idOrcamentoCenario = +route.paramMap.get(RouteParamEnum.idOrcamentoCenario);
    const idOrcamento = +route.paramMap.get(RouteParamEnum.idOrcamento);
    return this.planilhaVendasHibridaService.getCenario(idOrcamentoCenario, idOrcamento);
  }
}
