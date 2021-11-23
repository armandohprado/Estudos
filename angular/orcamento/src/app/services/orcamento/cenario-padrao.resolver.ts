import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { OrcamentoCenarioPadrao } from '@aw-models/cenario';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class CenarioPadraoResolver implements Resolve<OrcamentoCenarioPadrao> {
  constructor(private cenariosService: CenariosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<OrcamentoCenarioPadrao> | Promise<OrcamentoCenarioPadrao> | OrcamentoCenarioPadrao {
    const idOrcamentoCenario = +(route.paramMap.get(RouteParamEnum.idOrcamentoCenario) ?? 0);
    return this.cenariosService.getPadrao(idOrcamentoCenario);
  }
}
