import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Orcamento } from '../../models';
import { Observable } from 'rxjs';
import { OrcamentoService } from './orcamento.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class OrcamentoResolver implements Resolve<Orcamento> {
  constructor(private orcamentoService: OrcamentoService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Orcamento> | Promise<Orcamento> | Orcamento {
    const idOrcamento = +route.paramMap.get(RouteParamEnum.idOrcamento);
    const idOrcamentoCenario = +route.paramMap.get(RouteParamEnum.idOrcamentoCenario);
    return this.orcamentoService.buscarOrcamento(idOrcamento, idOrcamentoCenario);
  }
}
