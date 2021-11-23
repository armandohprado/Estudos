import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { UnidadeMedida } from '../../models/unidade-medida';
import { UnidadeMedidaService } from './unidade-medida.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnidadeMedidaResolver implements Resolve<UnidadeMedida[]> {
  constructor(private unidadeMedidaService: UnidadeMedidaService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<UnidadeMedida[]> | Promise<UnidadeMedida[]> | UnidadeMedida[] {
    return this.unidadeMedidaService.getUnidadeMedidas();
  }
}
