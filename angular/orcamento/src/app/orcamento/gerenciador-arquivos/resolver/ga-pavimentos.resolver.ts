import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { RouteParamEnum } from '../../../models/route-param.enum';
import { GaSite } from '../model/pavimento';

@Injectable({ providedIn: 'root' })
export class GaPavimentosResolver implements Resolve<GaSite[]> {
  constructor(private gerenciadorArquivosService: GerenciadorArquivosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<GaSite[]> | Promise<GaSite[]> | GaSite[] {
    const idProjeto = +route.paramMap.get(RouteParamEnum.idProjeto);
    return this.gerenciadorArquivosService.getPavimentos(idProjeto);
  }
}
