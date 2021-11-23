import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CnEmitirCc } from '../../../models/cn-emitir-cc';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CcGrupoService } from '../../state/grupos/cc-grupo.service';
import { CcGrupoQuery } from '../../state/grupos/cc-grupo.query';

@Injectable({ providedIn: 'root' })
export class EmitirCcGrupoTaxaResolver implements Resolve<CnEmitirCc> {
  constructor(private ccGruposService: CcGrupoService, private ccGruposQuery: CcGrupoQuery) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CnEmitirCc> | Promise<CnEmitirCc> | CnEmitirCc {
    const idCompraNegociacaoGrupo = +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    const grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    return this.ccGruposService.getEmitirCcDadosGrupoTaxa(idCompraNegociacaoGrupo, grupo.centralCompras);
  }
}
