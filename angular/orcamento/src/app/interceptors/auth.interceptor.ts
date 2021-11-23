import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.cookieService.get('aw_auth_token');
    const headers = req.headers.append('Authorization', `Bearer ${token}`);
    const reqClone = req.clone({ headers });
    return next.handle(reqClone);
  }
}
