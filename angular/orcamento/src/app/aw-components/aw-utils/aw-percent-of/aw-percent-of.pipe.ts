import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({ name: 'awPercentOf' })
export class AwPercentOfPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: any, base: any, digitsInfo?: string, locale?: string): string {
    if (!value || !base) {
      return '0%';
    }
    base = parseFloat(base);
    value = parseFloat(value);
    if (isNaN(base) || isNaN(value)) {
      return '0%';
    }
    return formatNumber((value / base) * 100, locale ?? this.locale, digitsInfo ?? '1.0-2') + '%';
  }
}
