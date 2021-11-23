import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CnClassificacao } from '../../models/cn-classificacao';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';

@Injectable({ providedIn: 'root' })
export class CnClassificacoesResolver implements Resolve<CnClassificacao[]> {
  constructor(private ccGruposService: CcGrupoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CnClassificacao[]> | Promise<CnClassificacao[]> | CnClassificacao[] {
    const idCompraNegociacaoGrupo = +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    return this.ccGruposService.getClassificacoes(idCompraNegociacaoGrupo);
  }
}
