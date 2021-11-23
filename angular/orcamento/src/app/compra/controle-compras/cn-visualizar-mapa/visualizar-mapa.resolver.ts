import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CnMapa } from '../../models/cn-mapa';

@Injectable({ providedIn: 'root' })
export class VisualizarMapaResolver implements Resolve<CnMapa> {
  constructor(private ccGruposService: CcGrupoService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CnMapa> | Promise<CnMapa> | CnMapa {
    return this.ccGruposService.getVisualizarMapa(
      +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupoMapa),
      +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo)
    );
  }
}
