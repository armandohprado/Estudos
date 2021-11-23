import { distinctUntilChanged, OperatorFunction, shareReplay } from 'rxjs';
import { ParamMap } from '@angular/router';
import { map } from 'rxjs/operators';
import { filterNilValue } from '@datorama/akita';

export function mapParamId(param: string): OperatorFunction<ParamMap, number> {
  return source =>
    source.pipe(
      map(paramMap => paramMap.get(param)),
      filterNilValue(),
      distinctUntilChanged(),
      map(Number),
      shareReplay()
    );
}
