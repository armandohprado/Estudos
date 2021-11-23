import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, UrlTree } from '@angular/router';
import { catchError, mapTo, Observable, of, tap } from 'rxjs';
import { AwMobileService, SistemaOperacionalEnum } from './codigo-resgate.service';

@Injectable({
  providedIn: 'root',
})
export class EnvioCodigoGuard implements CanActivate {
  constructor(private awMobileService: AwMobileService) {}
  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const idCodigoResgate = route.paramMap.get('idCodigoResgate') ?? '-1';
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return this.awMobileService
      .getCodigoResgate(idCodigoResgate, isIOS ? SistemaOperacionalEnum.ios : SistemaOperacionalEnum.android)
      .pipe(
        catchError(() => of(null)),
        tap(url => {
          if (url) {
            window.location.href = url.url;
          }
        }),
        mapTo(true)
      );
  }
}
