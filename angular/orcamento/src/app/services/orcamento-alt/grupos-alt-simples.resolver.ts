import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { GrupoAltSimples } from '@aw-models/grupo-alt-simples';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class GruposAltSimplesResolver implements Resolve<GrupoAltSimples[]> {
  constructor(private orcamentoAltService: OrcamentoAltService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<GrupoAltSimples[]> | Promise<GrupoAltSimples[]> | GrupoAltSimples[] {
    const idOrcamento = +(route.paramMap.get(RouteParamEnum.idOrcamento) ?? 0);
    const idOrcamentoCenario = +(route.paramMap.get(RouteParamEnum.idOrcamentoCenario) ?? 0);
    return this.orcamentoAltService.getGrupos(idOrcamento, idOrcamentoCenario);
  }
}
