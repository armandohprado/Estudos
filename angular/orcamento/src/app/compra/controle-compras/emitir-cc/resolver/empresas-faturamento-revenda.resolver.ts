import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { EmpresaFaturamento } from '@aw-models/empresa-faturamento';
import { ControleComprasService } from '../../state/controle-compras/controle-compras.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class EmpresasFaturamentoRevendaResolver implements Resolve<EmpresaFaturamento[]> {
  constructor(private controleComprasService: ControleComprasService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<EmpresaFaturamento[]> | Promise<EmpresaFaturamento[]> | EmpresaFaturamento[] {
    const idProjeto = +route.paramMap.get(RouteParamEnum.idProjeto);
    return this.controleComprasService.getEmpresasFaturamento(idProjeto, 'revenda');
  }
}
