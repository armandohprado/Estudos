import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { GaArquivoExtensao } from '../model/arquivo-extensao';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '../../../models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class GaExtensoesResolver implements Resolve<GaArquivoExtensao[]> {
  constructor(private gerenciadorArquivosService: GerenciadorArquivosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<GaArquivoExtensao[]> | Promise<GaArquivoExtensao[]> | GaArquivoExtensao[] {
    const idOrcamentoGrupo = +route.paramMap.get(RouteParamEnum.idOrcamentoGrupo);
    return this.gerenciadorArquivosService.getExtensoes(idOrcamentoGrupo);
  }
}
