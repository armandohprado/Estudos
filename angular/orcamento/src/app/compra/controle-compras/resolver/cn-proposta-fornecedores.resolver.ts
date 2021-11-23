import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CnFornecedor } from '../../models/cn-fornecedor';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class CnPropostaFornecedoresResolver implements Resolve<CnFornecedor[]> {
  constructor(private ccGruposService: CcGrupoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CnFornecedor[]> | Promise<CnFornecedor[]> | CnFornecedor[] {
    return this.ccGruposService.getPropostaFornecedores(+route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo));
  }
}
