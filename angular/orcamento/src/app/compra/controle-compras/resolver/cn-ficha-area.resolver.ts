import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ControleComprasService } from '../state/controle-compras/controle-compras.service';
import { CnArea } from '../../models/cn-area';

@Injectable({ providedIn: 'root' })
export class CnFichaAreaResolver implements Resolve<CnArea[]> {
  constructor(private controleComprasService: ControleComprasService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CnArea[]> {
    return this.controleComprasService.getAreas();
  }
}
