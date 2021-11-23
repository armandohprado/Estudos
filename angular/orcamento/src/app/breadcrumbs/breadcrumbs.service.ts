import { Injectable, Injector, Type } from '@angular/core';
import { Breadcrumb } from './breadcrumb';
import { concat, from, isObservable, Observable, of } from 'rxjs';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { concatMap, filter, first, map, mergeMap, startWith, toArray } from 'rxjs/operators';
import { BreadcrumbsResolver } from './breadcrumbs.resolver';
import { isFunction, isNil } from 'lodash-es';
import { RouteDataEnum } from '@aw-models/route-data.enum';

function wrapIntoObservable<T>(value: T | Promise<T> | Observable<T>): Observable<T> {
  return isObservable(value) ? value : from(Promise.resolve(value));
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbsService {
  constructor(protected router: Router, protected injector: Injector) {}

  private _defaultResolver = new BreadcrumbsResolver();

  readonly breadcrumbs$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(null),
    concatMap(() => this._onNavigationEnd())
  );
  readonly hideBreadcrumbs$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(null),
    map(() => this._getHideBreadcrumbs())
  );

  private _getHideBreadcrumbs(): boolean {
    let state = this.router.routerState.snapshot.root;
    let hideBreadcrumbs = state.data[RouteDataEnum.hideBreadcrumbs];
    let breadcrumbs: any | undefined = state.data[RouteDataEnum.breadcrumbs];
    while (state.firstChild) {
      state = state.firstChild;
      if (!isNil(state.data[RouteDataEnum.breadcrumbs])) {
        breadcrumbs = state.data[RouteDataEnum.breadcrumbs];
        hideBreadcrumbs = false;
      }
      if (!isNil(state.data[RouteDataEnum.hideBreadcrumbs])) {
        hideBreadcrumbs = state.data[RouteDataEnum.hideBreadcrumbs];
        breadcrumbs = undefined;
      }
    }
    return !!hideBreadcrumbs && !breadcrumbs;
  }

  private _onNavigationEnd(): Observable<Breadcrumb[]> {
    return this._resolveCrumbs(this.router.routerState.snapshot.root).pipe(
      mergeMap(breadcrumbs => breadcrumbs),
      toArray()
    );
  }

  private _resolveCrumbs(route: ActivatedRouteSnapshot): Observable<Breadcrumb[]> {
    let crumbs$: Observable<Breadcrumb[]> = of([]);
    const data = route.routeConfig?.data;

    if (data?.breadcrumbs) {
      const resolver = this._getBreadcrumbResolver(data.breadcrumbs);
      const result = resolver.resolve(route, this.router.routerState.snapshot);
      crumbs$ = wrapIntoObservable(result).pipe(first());
    }

    return route.firstChild ? concat(crumbs$, this._resolveCrumbs(route.firstChild)) : crumbs$;
  }

  private _getBreadcrumbResolver(breadcrumbs: string | Type<BreadcrumbsResolver>): BreadcrumbsResolver {
    return isFunction(breadcrumbs) && breadcrumbs.prototype instanceof BreadcrumbsResolver
      ? this.injector.get<BreadcrumbsResolver>(breadcrumbs)
      : this._defaultResolver;
  }
}
