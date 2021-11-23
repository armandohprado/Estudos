import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ControleComprasService } from '../state/controle-compras/controle-compras.service';
import { CnCausa } from '../../models/cn-causa';
import { refresh } from '@aw-utils/rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CnFichaCausaResolver implements Resolve<CnCausa[]> {
  constructor(private controleComprasService: ControleComprasService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CnCausa[]> {
    return this.controleComprasService
      .getCausas(state.url.includes('envio-mapa'))
      .pipe(refresh(this.controleComprasService.getCausasDispensa(6)));
  }
}
