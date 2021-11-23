import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { OrcamentoCenarioSimples } from '@aw-models/cenario';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class CenariosRelacionadosResolver implements Resolve<OrcamentoCenarioSimples[]> {
  constructor(private cenariosService: CenariosService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrcamentoCenarioSimples[]> {
    const idOrcamentoCenario = +(route.paramMap.get(RouteParamEnum.idOrcamentoCenario) ?? 0);
    return this.cenariosService.getRelacionados(idOrcamentoCenario);
  }
}
