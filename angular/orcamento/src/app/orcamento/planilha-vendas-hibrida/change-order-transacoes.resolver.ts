import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { PlanilhaVendasHibridaService } from './planilha-vendas-hibrida.service';
import { CcGrupoService } from '../../compra/controle-compras/state/grupos/cc-grupo.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { FamiliaTransacao } from './models/transacao';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ChangeOrderTransacoesResolver implements Resolve<[FamiliaTransacao[], FamiliaTransacao[]]> {
  constructor(
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private ccGruposService: CcGrupoService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<[FamiliaTransacao[], FamiliaTransacao[]]> {
    if (!state.url.includes('change-order')) {
      return;
    }
    const transacoes = this.ccGruposService.getTransacoesChangeOrder(
      +route.paramMap.get(RouteParamEnum.idOrcamentoCenario)
    );
    const transacoesCC = this.ccGruposService.getTransacoesChangeOrderCC(
      +route.paramMap.get(RouteParamEnum.idOrcamento)
    );
    return forkJoin([transacoes, transacoesCC]).pipe(
      tap(([familiasTransacoes, familiasTrasacoesCC]) => {
        this.planilhaVendasHibridaService.transacoes$.next(familiasTransacoes);
        this.planilhaVendasHibridaService.transacoesCC$.next(familiasTrasacoesCC);
      })
    );
  }
}
