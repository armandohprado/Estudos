import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ControleComprasService } from '../state/controle-compras/controle-compras.service';
import { Observable } from 'rxjs';
import { CnTipoFicha } from '../../models/cn-tipo-ficha';

@Injectable({ providedIn: 'root' })
export class CnOrigemCompraResolver implements Resolve<CnTipoFicha[]> {
  constructor(private controleComprasService: ControleComprasService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CnTipoFicha[]> | Promise<CnTipoFicha[]> | CnTipoFicha[] {
    return this.controleComprasService.getTiposFicha();
  }
}
