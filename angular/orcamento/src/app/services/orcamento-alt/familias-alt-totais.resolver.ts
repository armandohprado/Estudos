import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { FamiliaAltTotal } from '@aw-models/familia-alt';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FamiliasAltTotaisResolver implements Resolve<FamiliaAltTotal[]> {
  constructor(private orcamentoAltService: OrcamentoAltService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<FamiliaAltTotal[]> | Promise<FamiliaAltTotal[]> | FamiliaAltTotal[] {
    const idOrcamento = +(route.paramMap.get(RouteParamEnum.idOrcamento) ?? 0);
    const idOrcamentoCenario = +(route.paramMap.get(RouteParamEnum.idOrcamentoCenario) ?? 0);
    return this.orcamentoAltService.getFamiliasTotais(idOrcamento, idOrcamentoCenario);
  }
}
