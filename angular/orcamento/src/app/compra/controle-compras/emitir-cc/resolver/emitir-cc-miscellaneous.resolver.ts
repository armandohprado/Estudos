import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CnEmitirCc } from '../../../models/cn-emitir-cc';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Observable } from 'rxjs';
import { CcGrupoService } from '../../state/grupos/cc-grupo.service';
import { CcGrupoQuery } from '../../state/grupos/cc-grupo.query';

@Injectable({ providedIn: 'root' })
export class EmitirCcMiscellaneousResolver implements Resolve<CnEmitirCc> {
  constructor(private ccGruposService: CcGrupoService, private ccGruposQuery: CcGrupoQuery) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CnEmitirCc> | Promise<CnEmitirCc> | CnEmitirCc {
    const idCompraNegociacaoGrupo = +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    const index = +route.queryParamMap.get(RouteParamEnum.index);
    let grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    const misc = this.ccGruposQuery.getMisc(idCompraNegociacaoGrupo, index);
    const otherProperty =
      misc.propertyValor === 'valorSaldoContingencia' ? 'valorMargemRevenda' : 'valorSaldoContingencia';
    grupo = {
      ...grupo,
      [misc.propertyValor]: misc.valorTotalSelecionado,
      [otherProperty]: 0,
    };
    return this.ccGruposService.getEmitirCcDadosMiscellaneous(
      idCompraNegociacaoGrupo,
      grupo.valorSaldoContingenciaReservado,
      grupo.valorMargemRevenda
    );
  }
}
