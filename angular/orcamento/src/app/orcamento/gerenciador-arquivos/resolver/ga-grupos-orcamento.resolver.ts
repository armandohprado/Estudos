import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { RouteParamEnum } from '../../../models/route-param.enum';
import { GaGrupoOrcamento } from '../model/grupo-orcamento';

@Injectable({ providedIn: 'root' })
export class GaGruposOrcamentoResolver implements Resolve<GaGrupoOrcamento[]> {
  constructor(private gerenciadorArquivosService: GerenciadorArquivosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<GaGrupoOrcamento[]> | Promise<GaGrupoOrcamento[]> | GaGrupoOrcamento[] {
    return this.gerenciadorArquivosService.getGruposOrcamento(+route.paramMap.get(RouteParamEnum.idOrcamentoCenario));
  }
}
