import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ChaveRegistroService } from './chave-registro.service';

@Injectable({ providedIn: 'root' })
export class SpreadjsKeyGuard implements CanActivate {
  constructor(private spreadjsService: ChaveRegistroService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.spreadjsService.getSpreadjsKey().pipe(
      map(() => true),
      catchError(() => throwError(new Error('Erro ao tentar carregar a planilha, favor tentar novamente mais tarde')))
    );
  }
}
