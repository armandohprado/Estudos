import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';
import { WINDOW_TOKEN } from './tokens/window';
import { CookieService } from 'ngx-cookie-service';
import { CacheControlInterceptor } from './core/cache-control.interceptor';
import { ConfirmModalModule } from './shared/confirm-modal/confirm-modal.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HeaderDevComponent } from './header-dev/header-dev.component';

registerLocaleData(localePt, 'pt');

@NgModule({
  declarations: [AppComponent, HeaderDevComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, ConfirmModalModule.forRoot(), ModalModule.forRoot()],
  providers: [
    CookieService,
    { provide: WINDOW_TOKEN, useValue: window },
    { provide: LOCALE_ID, useValue: 'pt-Br' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CacheControlInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useValue: AuthErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
