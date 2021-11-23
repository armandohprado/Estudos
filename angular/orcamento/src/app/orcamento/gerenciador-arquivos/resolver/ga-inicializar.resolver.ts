import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '../../../models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class GaInicializarResolver implements Resolve<void> {
  constructor(private gerenciadorArquivosService: GerenciadorArquivosService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<void> | Promise<void> | void {
    const idProjeto = +route.paramMap.get(RouteParamEnum.idProjeto);
    const idOrcamentoGrupo = +route.paramMap.get(RouteParamEnum.idOrcamentoGrupo);
    return this.gerenciadorArquivosService.inicializar(idProjeto, idOrcamentoGrupo);
  }
}
