import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CcGrupoQuery } from './state/grupos/cc-grupo.query';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { parseUrlFromGuard } from '@aw-utils/util';

@Injectable({
  providedIn: 'root',
})
export class CnCompraNegociacaoGrupoGuard implements CanActivate {
  constructor(private ccGruposQuery: CcGrupoQuery, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const grupo = this.ccGruposQuery.buscarId(+next.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo));
    return (
      !!grupo ||
      this.router.createUrlTree([parseUrlFromGuard(state.url, '../../')], {
        queryParams: {
          [RouteParamEnum.idCompraNegociacaoGrupo]: next.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo),
        },
      })
    );
  }
}
