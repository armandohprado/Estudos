import { Pipe, PipeTransform } from '@angular/core';
import { Order, orderBy, OrderByType } from './aw-order-by';

@Pipe({ name: 'awOrderBy' })
export class AwOrderByPipe implements PipeTransform {
  transform<T>(value: T[], key?: keyof T, order?: Order): T[];
  transform<T>(value: T[], keys?: (keyof T)[], order?: Order): T[];
  transform<T>(value: T[], deepKey?: string | string[], order?: Order): T[];
  transform<T>(value: T[], deepKeys?: string[], order?: Order): T[];
  transform<T>(value: T[], comparator?: (valueA: T, valueB: T) => number): T[];
  transform<T, K extends keyof T>(value: T[], commands?: Record<K, Order>): T[];
  transform<T = any>(value: T[], keyOrCommand?: OrderByType<T>, order: Order = 'asc'): T[] {
    return orderBy(value, keyOrCommand, order);
  }
}
