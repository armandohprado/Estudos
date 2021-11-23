import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CnEmitirCc } from '../../../models/cn-emitir-cc';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Observable } from 'rxjs';
import { CcGrupoService } from '../../state/grupos/cc-grupo.service';
import { CcGrupoQuery } from '../../state/grupos/cc-grupo.query';

@Injectable({ providedIn: 'root' })
export class EmitirCcRevendaResolver implements Resolve<CnEmitirCc> {
  constructor(private ccGrupoService: CcGrupoService, private ccGrupoQuery: CcGrupoQuery) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CnEmitirCc> | Promise<CnEmitirCc> | CnEmitirCc {
    const idCompraNegociacaoGrupo = +(route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo) ?? -1);
    const index = +(route.queryParamMap.get(RouteParamEnum.index) ?? -1);
    const grupo = this.ccGrupoQuery.getEntity(idCompraNegociacaoGrupo);
    return this.ccGrupoService.getEmitirCcDadosRevenda(
      idCompraNegociacaoGrupo,
      grupo?.confirmacaoCompraRevenda[index]?.valorTotalNegociado ?? 0
    );
  }
}
