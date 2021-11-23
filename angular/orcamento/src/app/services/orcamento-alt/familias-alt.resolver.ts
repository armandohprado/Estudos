import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { FamiliaAlt } from '@aw-models/familia-alt';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class FamiliasAltResolver implements Resolve<FamiliaAlt[]> {
  constructor(private orcamentoAltService: OrcamentoAltService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FamiliaAlt[]> {
    const idOrcamento = +(route.paramMap.get(RouteParamEnum.idOrcamento) ?? 0);
    const idOrcamentoCenario = +(route.paramMap.get(RouteParamEnum.idOrcamentoCenario) ?? 0);
    return this.orcamentoAltService.getFamilias(idOrcamento, idOrcamentoCenario);
  }
}
