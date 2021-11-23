import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DataGerenciadorGruposService } from './data-gerenciador-grupos.service';
import { FamiliaGG } from '../state/gerenciador-grupo.model';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({
  providedIn: 'root',
})
export class GerenciadorGruposResolver implements Resolve<Observable<FamiliaGG[]>> {
  constructor(private dataGerenciadorGruposService: DataGerenciadorGruposService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FamiliaGG[]> {
    const idOrcamento = +route.paramMap.get(RouteParamEnum.idOrcamento);
    return this.dataGerenciadorGruposService.getMappeadFamilias(idOrcamento);
  }
}
