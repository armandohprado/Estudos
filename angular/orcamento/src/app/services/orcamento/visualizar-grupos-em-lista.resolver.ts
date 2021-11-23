import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';

@Injectable({
  providedIn: 'root',
})
export class VisualizarGruposEmListaResolver implements Resolve<boolean> {
  constructor(private orcamentoService: OrcamentoService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.orcamentoService.getVisualizarGruposEmLista(+route.paramMap.get(RouteParamEnum.idOrcamento));
  }
}
