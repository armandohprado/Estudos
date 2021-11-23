import { EMPTY, Observable, of } from 'rxjs';
import { Query, QueryEntity } from '@datorama/akita';

export interface AwCacheOptions<T> {
  emitNext?: boolean;
  emitNextWithValue?: boolean;
  getNextValue?(query: QueryEntity<T> | Query<T>): T;
  getHasCache?(query: QueryEntity<T> | Query<T>): boolean;
}

export const AW_CACHE_OPTIONS_DEFAULT: AwCacheOptions<any> = {
  emitNext: true,
  emitNextWithValue: true,
  getHasCache: query => query.getHasCache(),
  getNextValue: query => (query instanceof QueryEntity ? query.getAll() : query.getValue()),
};

export const awCache = <T>(query: QueryEntity<any> | Query<any>, options: AwCacheOptions<T> = {}) => (
  source: Observable<T>
) => {
  options = { ...AW_CACHE_OPTIONS_DEFAULT, ...options };
  if (options.getHasCache(query)) {
    source = EMPTY;
    if (options.emitNext) {
      let value = null;
      if (options.emitNextWithValue) {
        value = options.getNextValue(query);
      }
      source = of(value);
    }
    return new Observable<T>(observer =>
      source.subscribe({
        next(x): void {
          observer.next(x);
        },
        error(err): void {
          observer.error(err);
        },
        complete(): void {
          observer.complete();
        },
      })
    );
  } else {
    return source;
  }
};
