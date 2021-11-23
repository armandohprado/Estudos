import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { EpFornecedorResponse } from './model/fornecedor';
import { EqualizacaoPropostaService } from './equalizacao-proposta.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { EpInformacoes } from './model/informacaoes';

@Injectable({ providedIn: 'root' })
export class EqualizacaoPropostaResolver implements Resolve<[EpInformacoes, EpFornecedorResponse[]]> {
  constructor(private equalizacaoPropostaService: EqualizacaoPropostaService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<[EpInformacoes, EpFornecedorResponse[]]>
    | Promise<[EpInformacoes, EpFornecedorResponse[]]>
    | [EpInformacoes, EpFornecedorResponse[]] {
    const idOrcamentoGrupo = +route.paramMap.get(RouteParamEnum.idOrcamentoGrupo);
    const idOrcamentoCenario = +route.paramMap.get(RouteParamEnum.idOrcamentoCenario);
    return this.equalizacaoPropostaService.get(idOrcamentoGrupo, idOrcamentoCenario);
  }
}
