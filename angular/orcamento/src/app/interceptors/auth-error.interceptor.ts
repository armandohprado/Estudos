import { Inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchAndThrow } from '../utils/rxjs/operators';
import { WINDOW_TOKEN } from '../shared/tokens/window';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthErrorInterceptor implements HttpInterceptor {
  constructor(@Inject(WINDOW_TOKEN) private window: Window, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchAndThrow((err: HttpErrorResponse) => {
        if (err?.status === 401) {
          const urlRouter = '/orcamento' + this.router.url;
          this.window.location.href = this.router
            .createUrlTree(['login'], { queryParams: { ReturnUrl: urlRouter } })
            .toString();
        }
      })
    );
  }
}
