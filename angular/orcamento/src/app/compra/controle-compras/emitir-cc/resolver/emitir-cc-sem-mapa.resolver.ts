import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CnEmitirCc } from '../../../models/cn-emitir-cc';
import { CcGrupoService } from '../../state/grupos/cc-grupo.service';
import { forkJoin, Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EmitirCcSemMapaResolver implements Resolve<CnEmitirCc> {
  constructor(private ccGruposService: CcGrupoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CnEmitirCc> | Promise<CnEmitirCc> | CnEmitirCc {
    const idCompraNegociacaoGrupo = +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    const extratoTransacao$ = this.ccGruposService.getExtratoTransacao(idCompraNegociacaoGrupo);
    const emitirCcDados$ = this.ccGruposService.getEmitirCcDadosSemMapa(idCompraNegociacaoGrupo);
    return forkJoin([extratoTransacao$, emitirCcDados$]).pipe(
      map(([extratoTransacao, emitirCcDados]) => ({
        ...emitirCcDados,
        valorSaldoComTransferencias:
          emitirCcDados.valorSaldo +
          extratoTransacao.valorSaldoTransferido +
          extratoTransacao.valorSaldoTransferidoChangeOrder,
      }))
    );
  }
}
