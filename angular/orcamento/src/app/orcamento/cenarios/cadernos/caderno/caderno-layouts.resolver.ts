import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CadernoLayout } from '../../../../models/cadernos/cadernoLayout';
import { Observable } from 'rxjs';
import { CadernosService } from '../../../../services/orcamento/cadernos.service';
import { RouteParamEnum } from '../../../../models/route-param.enum';

@Injectable({ providedIn: 'root' })
export class CadernoLayoutsResolver implements Resolve<CadernoLayout[]> {
  constructor(private cadernosService: CadernosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CadernoLayout[]> | Promise<CadernoLayout[]> | CadernoLayout[] {
    return this.cadernosService.getCadernoLayouts(+route.paramMap.get(RouteParamEnum.idCaderno));
  }
}
