import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { SubFornecedor } from '@aw-models/devolucao-proposta/subfornecedor';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SubFornecedoresResolver implements Resolve<SubFornecedor[]> {
  constructor(private dataDevolucaoPropostaService: DataDevolucaoPropostaService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<SubFornecedor[]> | Promise<SubFornecedor[]> | SubFornecedor[] {
    const idProposta = +route.paramMap.get(RouteParamEnum.idDevolucaoProposta);
    return this.dataDevolucaoPropostaService.pegarSubfornecedoresProposta(idProposta);
  }
}
