import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CcGrupoQuery } from '../state/grupos/cc-grupo.query';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { parseUrlFromGuard } from '@aw-utils/util';

@Injectable({
  providedIn: 'root',
})
export class EmitirCcFornecedorInvalidoGuard implements CanActivate {
  constructor(private ccGruposQuery: CcGrupoQuery, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const idCompraNegociacaoGrupo = +next.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    const idCompraNegociacaoGrupoMapaFornecedor = +next.paramMap.get(
      RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor
    );
    const grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    const fornecedor = grupo?.confirmacaoCompraFornecedores?.find(
      forn => forn.idCompraNegociacaoGrupoMapaFornecedor === idCompraNegociacaoGrupoMapaFornecedor
    );
    if (!fornecedor?.emitirMapaEmissaoCompra) {
      return this.router.createUrlTree([parseUrlFromGuard(state.url, '../../../../../')], {
        queryParams: { [RouteParamEnum.idCompraNegociacaoGrupo]: idCompraNegociacaoGrupo },
      });
    }
    return true;
  }
}
