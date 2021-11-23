import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CheckListStatus } from '@aw-models/check-list-status';
import { CheckListIntegradoService } from './check-list-integrado.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CliStatusResolver implements Resolve<CheckListStatus[]> {
  constructor(private checkListIntegradoService: CheckListIntegradoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CheckListStatus[]> | Promise<CheckListStatus[]> | CheckListStatus[] {
    return this.checkListIntegradoService.getStatus();
  }
}
