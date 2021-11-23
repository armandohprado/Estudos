import { cacheable as _cacheable, setLoading, Store } from '@datorama/akita';
import { Predicate } from '@aw-utils/types/predicate';
import { Observable, throwError } from 'rxjs';
import { ErrorApi, ErrorApiMoreInfo } from '../../../grupo/definicao-escopo/model/error-api';

export function catchErrorHandler<T>(
  store: Store<T>,
  error: string,
  callAgain?: Predicate,
  args?: any[],
  moreInfo?: ErrorApiMoreInfo
): (error: any) => Observable<never> {
  return (err: any): Observable<never> => {
    store.setError<ErrorApi>({
      error,
      args: args ?? [],
      callAgain,
      moreInfo,
    });
    return throwError(err);
  };
}

export interface CacheableOptions {
  updateLoading?: boolean;
  emitNext?: boolean;
}

export function cacheable<T>(
  store: Store,
  request: Observable<T>,
  options: CacheableOptions = {
    updateLoading: true,
    emitNext: false,
  }
): Observable<T> {
  return _cacheable(store, request, { emitNext: options.emitNext }).pipe(setLoading(store));
}
