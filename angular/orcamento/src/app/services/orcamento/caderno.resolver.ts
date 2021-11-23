import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CadernosService } from './cadernos.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Caderno } from '@aw-models/cadernos/caderno';
import { refreshAll } from '@aw-utils/rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CadernoResolver implements Resolve<Caderno> {
  constructor(private cadernosService: CadernosService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Caderno> {
    return this.cadernosService
      .refreshCaderno(
        +route.paramMap.get(RouteParamEnum.idCaderno),
        +route.paramMap.get(RouteParamEnum.idOrcamentoCenario)
      )
      .pipe(
        refreshAll([
          this.cadernosService.getOrcamentoGrupos(+route.paramMap.get(RouteParamEnum.idOrcamentoCenario)),
          this.cadernosService.getCentrosCustoPorProjeto(+route.paramMap.get(RouteParamEnum.idProjeto)),
          this.cadernosService.getPavimentos(+route.paramMap.get(RouteParamEnum.idOrcamento)),
        ])
      );
  }
}
