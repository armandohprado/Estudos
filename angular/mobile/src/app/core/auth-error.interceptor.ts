import { Inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { WINDOW_TOKEN } from '../tokens/window';

@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {
  constructor(@Inject(WINDOW_TOKEN) private window: Window, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err?.status === 401) {
          const urlRouter = '/orcamento' + this.router.url;
          this.window.location.href = this.router
            .createUrlTree(['login'], { queryParams: { ReturnUrl: urlRouter } })
            .toString();
        }
        return throwError( () => err)
      })
    );
  }
}
