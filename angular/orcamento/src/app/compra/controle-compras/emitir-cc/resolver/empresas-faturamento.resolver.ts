import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { EmpresaFaturamento } from '@aw-models/empresa-faturamento';
import { ControleComprasService } from '../../state/controle-compras/controle-compras.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CcGrupoQuery } from '../../state/grupos/cc-grupo.query';

@Injectable({ providedIn: 'root' })
export class EmpresasFaturamentoResolver implements Resolve<EmpresaFaturamento[]> {
  constructor(private controleComprasService: ControleComprasService, private ccGruposQuery: CcGrupoQuery) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<EmpresaFaturamento[]> | Promise<EmpresaFaturamento[]> | EmpresaFaturamento[] {
    const idProjeto = +route.paramMap.get(RouteParamEnum.idProjeto);
    const idCompraNegociacaoGrupo = +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    const { tipo } = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    return this.controleComprasService.getEmpresasFaturamento(idProjeto, tipo);
  }
}
