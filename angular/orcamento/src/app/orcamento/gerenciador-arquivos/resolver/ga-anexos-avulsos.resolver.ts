import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { RouteParamEnum } from '../../../models/route-param.enum';
import { GaAnexoAvulso } from '../model/anexo-avulso';

@Injectable({ providedIn: 'root' })
export class GaAnexosAvulsosResolver implements Resolve<GaAnexoAvulso[]> {
  constructor(private gerenciadorArquivosService: GerenciadorArquivosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<GaAnexoAvulso[]> | Promise<GaAnexoAvulso[]> | GaAnexoAvulso[] {
    const idOrcamentoGrupo = +route.paramMap.get(RouteParamEnum.idOrcamentoGrupo);
    return this.gerenciadorArquivosService.getAnexosAvulsos(idOrcamentoGrupo);
  }
}
