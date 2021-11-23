import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'every',
})
export class EveryPipe implements PipeTransform {
  /**
   * @param array array de items
   * @param key propriedade do item
   * @param value valor para ser comparado no array.every
   */
  transform<T = any, K extends keyof T = keyof T>(array: T[], key: K, value?: T[K]): boolean {
    if (!array?.length || !key) {
      return false;
    }
    const callback = value ? (item: T) => item[key] === value : (item: T) => item[key];
    return array.every(callback);
  }
}
