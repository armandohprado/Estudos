import { Injectable } from '@angular/core';
import { CnEmitirCc } from '../../../models/cn-emitir-cc';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CcGrupoService } from '../../state/grupos/cc-grupo.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class EmitirCcResolver implements Resolve<CnEmitirCc> {
  constructor(private ccGruposService: CcGrupoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CnEmitirCc> | Promise<CnEmitirCc> | CnEmitirCc {
    const idCompraNegociacaoGrupo = +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    const idCompraNegociacaoGrupoMapaFornecedor = +route.paramMap.get(
      RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor
    );
    return this.ccGruposService.getEmitirCcDados(idCompraNegociacaoGrupo, idCompraNegociacaoGrupoMapaFornecedor);
  }
}
