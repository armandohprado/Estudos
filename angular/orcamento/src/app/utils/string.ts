import { isString } from 'lodash-es';

export function normalize(str: any): string {
  return ('' + str)
    .normalize('NFKD')
    .replace(
      /[\u0300-\u036F\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g,
      ''
    );
}

export function isKeyof<T = any>(value: any): value is keyof T {
  return isString(value);
}
