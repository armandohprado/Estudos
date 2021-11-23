import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DevolucaoPropostaService } from './devolucao-proposta.service';
import { DataDevolucaoPropostaService } from './data-devolucao-proposta.service';
import { SubFornecedor } from '../../models/devolucao-proposta/subfornecedor';
import { RouteParamEnum } from '../../models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class SubFornecedoresResolver implements Resolve<SubFornecedor[]> {
  constructor(
    private devolucaoPropostaService: DevolucaoPropostaService,
    private dataDevolucaoPropostaService: DataDevolucaoPropostaService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SubFornecedor[]> {
    return this.dataDevolucaoPropostaService.pegarSubfornecedoresProposta(
      +route.paramMap.get(RouteParamEnum.idDevolucaoProposta)
    );
  }
}
