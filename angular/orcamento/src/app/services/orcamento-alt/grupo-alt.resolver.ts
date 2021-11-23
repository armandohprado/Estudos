import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { GrupoAlt } from '@aw-models/grupo-alt';

@Injectable({ providedIn: 'root' })
export class GrupoAltResolver implements Resolve<GrupoAlt> {
  constructor(private orcamentoAltService: OrcamentoAltService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<GrupoAlt> | Promise<GrupoAlt> | GrupoAlt {
    const idOrcamento = +(route.paramMap.get(RouteParamEnum.idOrcamento) ?? 0);
    const idOrcamentoCenario = +(route.paramMap.get(RouteParamEnum.idOrcamentoCenario) ?? 0);
    const idOrcamentoGrupo = +(route.paramMap.get(RouteParamEnum.idOrcamentoGrupo) ?? 0);
    return this.orcamentoAltService.getGrupo(idOrcamento, idOrcamentoCenario, idOrcamentoGrupo);
  }
}
