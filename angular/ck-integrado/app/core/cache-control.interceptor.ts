import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CacheControlInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headers = req.headers
      .append('Cache-Control', 'no-cache, no-store, must-revalidate')
      .append('Pragma', 'no-cache')
      .append('Expires', '0');
    const reqClone = req.clone({ headers });
    return next.handle(reqClone);
  }
}
