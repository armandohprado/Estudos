import { Injectable } from '@angular/core';
import { ChaveRegistroService } from '@aw-services/chave-registro/chave-registro.service';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SpreadjsKeyGuard implements CanActivate {
  constructor(private spreadjsService: ChaveRegistroService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.spreadjsService.getSpreadjsKey().pipe(
      map(() => true),
      catchError(() =>
        throwError(() => new Error('Erro ao tentar carregar a planilha, favor tentar novamente mais tarde'))
      )
    );
  }
}
