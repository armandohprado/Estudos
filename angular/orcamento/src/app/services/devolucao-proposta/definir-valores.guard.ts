import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '../../models/route-param.enum';
import { map } from 'rxjs/operators';
import { DataDevolucaoPropostaService } from './data-devolucao-proposta.service';

@Injectable({
  providedIn: 'root',
})
export class DefinirValoresGuard implements CanDeactivate<boolean> {
  constructor(private dataDevolucaoProposta: DataDevolucaoPropostaService) {}

  canDeactivate(
    component: any,
    route: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const idProposta = +route.paramMap.get(RouteParamEnum.idDevolucaoProposta);
    const visaoNegociacao = route.data[RouteParamEnum.supply];
    const idCompraNegociacaoGrupoMapaFornecedor = route.paramMap.has(
      RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor
    )
      ? +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor)
      : undefined;
    return this.dataDevolucaoProposta
      .preencherProposta(idProposta, visaoNegociacao, idCompraNegociacaoGrupoMapaFornecedor)
      .pipe(map(() => true));
  }
}
