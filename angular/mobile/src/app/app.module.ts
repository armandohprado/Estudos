import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import localePt from '@angular/common/locales/pt';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { registerLocaleData } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { WINDOW_TOKEN } from './tokens/window';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodigoResgateComponent } from './codigo-resgate/codigo-resgate.component';
import { RedirectComponent } from './codigo-resgate/redirect/redirect.component';
import { NovidadeComponent } from './novidades/novidade.component';
import { NovCardReComponent } from './novidades/nov-card-re/nov-card-re.component';
import { NovCardCComponent } from './novidades/nov-card-c/nov-card-c.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap/alert';

registerLocaleData(localePt, 'pt');

@NgModule({
  declarations: [
    AppComponent,
    CodigoResgateComponent,
    RedirectComponent,
    NovidadeComponent,
    NovCardReComponent,
    NovCardCComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    AlertModule,
  ],
  providers: [
    CookieService,
    { provide: WINDOW_TOKEN, useValue: window },
    { provide: LOCALE_ID, useValue: 'pt-Br' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
