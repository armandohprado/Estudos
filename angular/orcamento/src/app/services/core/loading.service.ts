import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _requestCount$ = new BehaviorSubject<number>(0);
  readonly isLoading$ = this._requestCount$.pipe(
    distinctUntilChanged(),
    map(loading => !!loading)
  );

  newRequest(): void {
    this._requestCount$.next(this._requestCount$.value + 1);
  }

  deleteRequest(): void {
    this._requestCount$.next(Math.max(this._requestCount$.value - 1, 0));
  }
}
