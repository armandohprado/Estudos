import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { mapTo, Observable } from 'rxjs';
import { DevolucaoPropostaService } from './devolucao-proposta.service';
import { Orcamento } from '../../models';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({
  providedIn: 'root',
})
export class DevolucaoPropostaGuard implements CanDeactivate<Orcamento> {
  constructor(private devolucaoProposta: DevolucaoPropostaService, private orcamentoAltService: OrcamentoAltService) {}

  canDeactivate(
    component: Orcamento,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const idOrcamento = currentRoute.paramMap.get(RouteParamEnum.idOrcamento);
    const idOrcamentoCenario = currentRoute.paramMap.get(RouteParamEnum.idOrcamentoCenario);
    if (this.devolucaoProposta.cabecalhoProposta?.idOrcamentoGrupo && idOrcamento && idOrcamentoCenario) {
      return this.orcamentoAltService
        .getGrupo(+idOrcamento, +idOrcamentoCenario, this.devolucaoProposta.cabecalhoProposta.idOrcamentoGrupo)
        .pipe(mapTo(true));
    }
    return true;
  }
}
