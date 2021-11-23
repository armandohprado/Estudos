import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { InformacaoProposta } from './models/excel';
import { ExcelDefinirValoresService } from './excel-definir-valores.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InformacaoPropostaResolver implements Resolve<InformacaoProposta> {
  constructor(private excelDefinirValoresService: ExcelDefinirValoresService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<InformacaoProposta> | Promise<InformacaoProposta> | InformacaoProposta {
    const idProposta = +route.paramMap.get(RouteParamEnum.idDevolucaoProposta);
    const idPavimento = +route.paramMap.get(RouteParamEnum.idPavimento);
    return this.excelDefinirValoresService.getInformacaoProposta(idProposta, idPavimento);
  }
}
