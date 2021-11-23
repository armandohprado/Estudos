import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { ControleComprasService } from './state/controle-compras/controle-compras.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CcGrupoService } from './state/grupos/cc-grupo.service';

@Injectable({ providedIn: 'root' })
export class ResetStateGuard implements CanActivate {
  constructor(private controleComprasService: ControleComprasService, private ccGruposService: CcGrupoService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const idOrcamentoCenario = +route.paramMap.get(RouteParamEnum.idOrcamentoCenario);
    if (this.controleComprasService.lastIdOrcamentoCenario !== idOrcamentoCenario) {
      this.controleComprasService.reset();
      this.ccGruposService.reset();
    }
    this.controleComprasService.lastIdOrcamentoCenario = idOrcamentoCenario;
    return true;
  }
}
