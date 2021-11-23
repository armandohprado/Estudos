import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { FasesListaProposta } from './models/excel';
import { ExcelDefinirValoresService } from './excel-definir-valores.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ListaPropostaResolver implements Resolve<FasesListaProposta[]> {
  constructor(private excelDefinirValoresService: ExcelDefinirValoresService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<FasesListaProposta[]> | Promise<FasesListaProposta[]> | FasesListaProposta[] {
    const idProposta = +route.paramMap.get(RouteParamEnum.idDevolucaoProposta);
    const idPavimento = +route.paramMap.get(RouteParamEnum.idPavimento);
    return this.excelDefinirValoresService.getListaProposta(idProposta, idPavimento);
  }
}
