import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Cenario } from '../../models';
import { Observable, switchMap } from 'rxjs';
import { CenariosService } from './cenarios.service';
import { OrcamentoService } from './orcamento.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class CenariosPadraoResolver implements Resolve<Cenario[]> {
  constructor(private orcamentoService: OrcamentoService, private cenariosService: CenariosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Cenario[]> | Promise<Cenario[]> | Cenario[] {
    const idOrcamento = +route.paramMap.get(RouteParamEnum.idOrcamento);
    const idOrcamentoCenario = +route.paramMap.get(RouteParamEnum.idOrcamentoCenario);
    return this.cenariosService
      .getPadrao(idOrcamentoCenario)
      .pipe(
        switchMap(cenarioPadrao =>
          this.cenariosService.getCenarios(idOrcamento, cenarioPadrao.idOrcamentoCenarioPadrao)
        )
      );
  }
}
