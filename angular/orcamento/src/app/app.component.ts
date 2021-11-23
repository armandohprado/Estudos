import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { LoadingService } from './services/core/loading.service';
import { WINDOW_TOKEN } from './shared/tokens/window';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private awDialogService: AwDialogService,
    private loadingService: LoadingService,
    @Inject(WINDOW_TOKEN) private window: Window,
    private routerQuery: RouterQuery,
    private breadcrumbsService: BreadcrumbsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private readonly _destroy$ = new Subject<void>();
  readonly isBuild = environment.build;
  readonly showBreadcrumbs$ = this.breadcrumbsService.hideBreadcrumbs$.pipe(map(hideBreadcrumbs => !hideBreadcrumbs));

  loading = true;

  private initRouterEvents(): void {
    this.router.events.pipe(takeUntil(this._destroy$)).subscribe(navigationEvent => {
      if (navigationEvent instanceof NavigationStart) {
        this.loading = true;
      }
      if (navigationEvent instanceof NavigationError) {
        this.loading = false;
        this.awDialogService.error(
          'Erro',
          navigationEvent.error?.message ?? 'Ocorreu um erro na busca dos dados, por favor tente novamente!'
        );
        // tslint:disable-next-line:no-console
        console.error({ navigationEvent });
      }
      if (navigationEvent instanceof NavigationCancel) {
        this.loading = false;
        this.awDialogService.error('Não autorizado', 'Acesso a tela não autorizado!');
        // tslint:disable-next-line:no-console
        console.error({ navigationEvent });
      }
      if (navigationEvent instanceof NavigationEnd) {
        this.loading = false;
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  initLoadingWatch(): void {
    this.loadingService.isLoading$.pipe(takeUntil(this._destroy$)).subscribe(isLoading => {
      if (isLoading) {
        this.window.awLoading().start();
      } else {
        this.window.awLoading().stop();
      }
    });
  }

  ngOnInit(): void {
    this.initRouterEvents();
    this.initLoadingWatch();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
