import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { FamiliaAlt } from '@aw-models/familia-alt';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { validateTotalPorPaginaQueryParam } from '@aw-services/orcamento-alt/orcamento-alt-utils';
import { PaginacaoComRange } from '@aw-models/paginacao';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FamiliasAltPaginacaoResolver implements Resolve<PaginacaoComRange<FamiliaAlt>> {
  constructor(private orcamentoAltService: OrcamentoAltService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaginacaoComRange<FamiliaAlt>> {
    const idOrcamento = +(route.paramMap.get(RouteParamEnum.idOrcamento) ?? 0);
    const idOrcamentoCenario = +(route.paramMap.get(RouteParamEnum.idOrcamentoCenario) ?? 0);
    const paginaAtual = +(route.queryParamMap.get(RouteParamEnum.paginaAtual) ?? 1);
    const totalPorPagina = validateTotalPorPaginaQueryParam(route.queryParamMap.get(RouteParamEnum.totalPorPagina));
    const idOrcamentoGrupos = route.queryParamMap.getAll(RouteParamEnum.idOrcamentoGrupos);
    if (idOrcamentoGrupos.length) {
      return this.orcamentoAltService
        .getGruposFiltro(idOrcamento, idOrcamentoCenario, idOrcamentoGrupos.map(Number))
        .pipe(
          map(familias => ({
            paginaAtual,
            totalPorPagina,
            totalPaginas: 1,
            totalItens: 1,
            range: [],
            retorno: familias,
          }))
        );
    }
    return this.orcamentoAltService.getFamiliasPaginacao(idOrcamento, idOrcamentoCenario, paginaAtual, totalPorPagina);
  }
}
