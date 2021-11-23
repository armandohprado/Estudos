import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ExcelDefinirValoresComponent } from './excel-definir-valores.component';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SalvarFilaGuard implements CanDeactivate<unknown> {
  canDeactivate(
    component: ExcelDefinirValoresComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return component.voltar().pipe(map(() => true));
  }
}
