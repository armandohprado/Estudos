import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CliFuncao } from '@aw-models/funcao';
import { isValidBase64 } from '@aw-utils/utils';

@Injectable({ providedIn: 'root' })
export class CliFuncaoGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const funcaoHash = route.queryParamMap.get(RouteParamEnum.funcao);
    if (funcaoHash && isValidBase64(funcaoHash)) {
      const funcao = atob(funcaoHash) as CliFuncao;
      if (['Gerencial', 'GI'].includes(funcao)) {
        return true;
      }
    }
    alert('Não é possível carregar as informações');
    return false;
  }
}
