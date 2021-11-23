import { Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { LoadingService } from '../services/core/loading.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.newRequest();
    return next.handle(req).pipe(
      finalize(() => {
        this.loadingService.deleteRequest();
      })
    );
  }
}
