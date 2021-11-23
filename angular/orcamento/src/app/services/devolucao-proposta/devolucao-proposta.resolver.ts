import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DevolucaoPropostaService } from './devolucao-proposta.service';
import { DataDevolucaoPropostaService } from './data-devolucao-proposta.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Pavimento } from '@aw-models/devolucao-proposta/pavimento-dp';

@Injectable({ providedIn: 'root' })
export class DevolucaoPropostaResolver implements Resolve<Pavimento> {
  constructor(
    private devolucaoPropostaService: DevolucaoPropostaService,
    private dataDevolucaoPropostaService: DataDevolucaoPropostaService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Pavimento> {
    const idProposta = +route.paramMap.get(RouteParamEnum.idDevolucaoProposta);
    const visaoNegociacao = route.data[RouteParamEnum.supply];
    const idCompraNegociacaoGrupoMapaFornecedor = route.paramMap.has(
      RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor
    )
      ? +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor)
      : undefined;

    return this.dataDevolucaoPropostaService.preencherProposta(
      idProposta,
      visaoNegociacao,
      idCompraNegociacaoGrupoMapaFornecedor
    );
  }
}
