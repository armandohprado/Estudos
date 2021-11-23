import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { registerLocaleData } from '@angular/common';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { WINDOW_TOKEN } from './shared/tokens/window';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { environment } from '../environments/environment';
import { NgxsDispatchPluginModule } from '@ngxs-labs/dispatch-decorator';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxCurrencyModule } from 'ngx-currency';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { AppComponent } from './app.component';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule, RouterQuery } from '@datorama/akita-ng-router-store';
import { NgxMaskModule } from 'ngx-mask';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { defineLocale, ptBrLocale } from 'ngx-bootstrap/chronos';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AlertModule } from 'ngx-bootstrap/alert';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxsModule } from '@ngxs/store';
import { DEFAULT_PIPE_TYPE } from './shared/pipes/default/default.token';
import { DefaultPipeType } from './shared/pipes/default/default.pipe';
import { AwRouterQuery } from './services/core/router.query';
import { CookieService } from 'ngx-cookie-service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthErrorInterceptor } from './interceptors/auth-error.interceptor';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { PortalSupplyInterceptor } from './services/devolucao-proposta/portal-supply.interceptor';
import { AwModalService } from '@aw-services/core/aw-modal-service';

registerLocaleData(localePt, 'pt');

@NgModule({
  declarations: [AppComponent, BreadcrumbsComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule.forRoot(),
    NgxsModule.forRoot([], {
      developmentMode: !environment.build,
      selectorOptions: { suppressErrors: false, injectContainerState: false },
    }),
    NgxsDispatchPluginModule.forRoot(),
    !environment.build
      ? NgxsReduxDevtoolsPluginModule.forRoot({
          disabled: environment.build,
        })
      : [],
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    AccordionModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    AlertModule.forRoot(),
    PaginationModule.forRoot(),
    PopoverModule.forRoot(),
    NgxCurrencyModule.forRoot({
      prefix: '',
      nullable: false,
      align: 'right',
      allowNegative: true,
      allowZero: true,
      decimal: ',',
      precision: 2,
      suffix: '',
      thousands: '.',
    }),
    AwComponentsModule,
    environment.build ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule,
    NgxMaskModule.forRoot(),
  ],
  providers: [
    CookieService,
    { provide: WINDOW_TOKEN, useValue: window },
    { provide: LOCALE_ID, useValue: 'pt-Br' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PortalSupplyInterceptor,
      multi: true,
    },
    {
      provide: DEFAULT_PIPE_TYPE,
      useValue: 'strict' as DefaultPipeType,
    },
    {
      provide: RouterQuery,
      useExisting: AwRouterQuery,
    },
    {
      provide: BsModalService,
      useExisting: AwModalService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private localeService: BsLocaleService) {
    ptBrLocale.invalidDate = '';
    defineLocale('custom', ptBrLocale);
    localeService.use('custom');
  }
}
