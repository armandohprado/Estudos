import { Injectable } from '@angular/core';
import { Caderno } from '@aw-models/cadernos/caderno';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class CadernosResolver implements Resolve<Caderno[]> {
  constructor(private cadernosService: CadernosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Caderno[]> | Promise<Caderno[]> | Caderno[] {
    const idOrcamentoCenario = +route.paramMap.get(RouteParamEnum.idOrcamentoCenario);
    return this.cadernosService.getCadernos(idOrcamentoCenario);
  }
}
