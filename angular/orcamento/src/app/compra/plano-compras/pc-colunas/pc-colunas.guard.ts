import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PcGridService } from '../pc-grid/pc-grid.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({
  providedIn: 'root',
})
export class PcColunasGuard implements CanActivate {
  constructor(private pcGridService: PcGridService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // TODO corrigir isso, quando é change-order, isso não funciona (obviamente)
    const pathCompras = [
      '/projetos',
      next.paramMap.get(RouteParamEnum.idProjeto),
      'orcamentos',
      next.paramMap.get(RouteParamEnum.idOrcamento),
      'cenarios',
      next.paramMap.get(RouteParamEnum.idOrcamentoCenario),
      'compras',
    ];
    if (state.url.includes('controle-compra')) {
      pathCompras.push('controle-compra');
    }
    pathCompras.push('plano-compras');
    return !!this.pcGridService.columnApi || this.router.createUrlTree(pathCompras);
  }
}
