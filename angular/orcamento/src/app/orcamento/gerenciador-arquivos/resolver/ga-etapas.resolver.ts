import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '../../../models/route-param.enum';
import { isNil } from 'lodash-es';
import { convertToBoolProperty } from '../../../aw-components/util/helpers';
import { GaEtapa } from '../model/etapa';

@Injectable({ providedIn: 'root' })
export class GaEtapasResolver implements Resolve<GaEtapa[]> {
  constructor(private gerenciadorArquivosService: GerenciadorArquivosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<GaEtapa[]> | Promise<GaEtapa[]> | GaEtapa[] {
    const idProjeto = +route.paramMap.get(RouteParamEnum.idProjeto);
    const idOrcamentoGrupo = +route.paramMap.get(RouteParamEnum.idOrcamentoGrupo);
    const apenasSelecionadosRoute = route.queryParamMap.get('apenasSelecionados');
    const apenasSelecionados = !isNil(apenasSelecionadosRoute) ? convertToBoolProperty(apenasSelecionadosRoute) : false;
    return this.gerenciadorArquivosService.getEtapas(idProjeto, idOrcamentoGrupo, apenasSelecionados);
  }
}
