import { catchError, map, switchMap } from 'rxjs/operators';
import { MonoTypeOperatorFunction, Observable, throwError } from 'rxjs';

export const refresh = <T = any, R = any>(observable: Observable<R>): MonoTypeOperatorFunction<T> =>
  switchMap(data => observable.pipe(map(() => data)));

export const refreshMap = <T, R = any>(callback: (data: T) => Observable<R>): MonoTypeOperatorFunction<T> =>
  switchMap(data => callback(data).pipe(map(() => data)));

export const catchAndThrow = <T>(callback: (errors: any) => any): MonoTypeOperatorFunction<T> =>
  catchError(err => {
    const newError = callback(err);
    return throwError(newError ?? err);
  });
