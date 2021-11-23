import { HttpParams } from '@angular/common/http';
import { isDate, isNil } from 'lodash-es';

export class AwHttpParams extends HttpParams {
  constructor(object?: { [id: string]: any }, excludeNil?: boolean) {
    if (object) {
      const entries = Object.entries(object);
      const fromObject: Record<string, any> = {};
      for (const [key, value] of entries) {
        if (excludeNil && (isNil(value) || value === '')) {
          continue;
        }
        fromObject[key] = isDate(value) ? value.toISOString() : value;
      }
      super({ fromObject });
    } else {
      super();
    }
  }
}
