import { HttpParams as OriginHttpParams } from '@angular/common/http';
import { isDate, isNil } from '@aw-utils/utils';

export class AwHttpParams extends OriginHttpParams {
  constructor(fromObject?: { [id: string]: any }, excludeNil?: boolean) {
    if (fromObject) {
      let entries = Object.entries(fromObject);
      if (excludeNil) {
        entries = entries.filter(([, value]) => !isNil(value) && value !== '');
      }
      fromObject = entries.reduce((obj, [key, value]) => ({ ...obj, [key]: convertToString(value) }), {});
      super({ fromObject });
    } else {
      super();
    }
  }
}

const convertToString = (value: any): string => (isDate(value) ? value.toISOString() : value?.toString?.() ?? '');
