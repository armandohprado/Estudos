import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { GrupoTransferencia } from '@aw-models/controle-compras/grupo-transferencia';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';
import { Observable } from 'rxjs';
import { CcGrupoQuery } from '../state/grupos/cc-grupo.query';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class CnGruposTransferenciaResolver implements Resolve<GrupoTransferencia[]> {
  constructor(private ccGruposService: CcGrupoService, private ccGruposQuery: CcGrupoQuery) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<GrupoTransferencia[]> | Promise<GrupoTransferencia[]> | GrupoTransferencia[] {
    const idCompraNegociacaoGrupo = +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    const grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    return this.ccGruposService.getGruposTransferencia(idCompraNegociacaoGrupo, grupo.idCompraNegociacao, grupo.tipo);
  }
}
