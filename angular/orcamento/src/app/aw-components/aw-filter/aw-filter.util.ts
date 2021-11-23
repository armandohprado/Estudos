import { AwFilterConditionalTypes, AwFilterPosition, AwFilterPositions, AwFilterType } from './aw-filter.type';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { isArray, isEmpty, isObject } from 'lodash-es';
import { AwFilterPipeProperties, AwFilterPipeType } from './aw-filter.pipe';
import { isAfter, isBefore, isEqual, isWithinInterval, startOfDay } from 'date-fns';

export const NUMBER_COMPARATOR = {
  maior(valueA: number, valueB: number): boolean {
    return valueA > valueB;
  },
  maiorIgual(valueA: number, valueB: number): boolean {
    return valueA >= valueB;
  },
  menor(valueA: number, valueB: number): boolean {
    return valueA < valueB;
  },
  menorIgual(valueA: number, valueB: number): boolean {
    return valueA <= valueB;
  },
  igual(valueA: number, valueB: number): boolean {
    return valueA === valueB;
  },
  naoIgual(valueA: number, valueB: number): boolean {
    return valueA !== valueB;
  },
  entre(valueA: number, valueB: number, valueC: number): boolean {
    return valueA >= valueB && valueA <= valueC;
  },
};

export const TEXT_COMPARATOR = {
  contem(valueA: string, valueB: string): boolean {
    return valueA?.toLowerCase()?.includes(valueB?.toLowerCase());
  },
  naoContem(valueA: string, valueB: string): boolean {
    return !valueA || !valueA.toLowerCase().includes(valueB.toLowerCase());
  },
  igual(valueA: string, valueB: string): boolean {
    return valueA?.toLowerCase() === valueB?.toLowerCase();
  },
  naoIgual(valueA: string, valueB: string): boolean {
    return valueA?.toLowerCase() !== valueB?.toLowerCase();
  },
  comeca(valueA: string, valueB: string): boolean {
    return valueA?.toLowerCase()?.startsWith(valueB?.toLowerCase());
  },
  termina(valueA: string, valueB: string): boolean {
    return valueA?.toLowerCase()?.endsWith(valueB?.toLowerCase());
  },
};

export const DATE_COMPARATOR = {
  igual(valueA: Date, valueB: Date): boolean {
    return isEqual(startOfDay(valueA), startOfDay(valueB));
  },
  naoIgual(valueA: Date, valueB: Date): boolean {
    return !valueA || !isEqual(startOfDay(valueA), startOfDay(valueB));
  },
  maior(valueA: Date, valueB: Date): boolean {
    return isAfter(startOfDay(valueA), startOfDay(valueB));
  },
  menor(valueA: Date, valueB: Date): boolean {
    return isBefore(startOfDay(valueA), startOfDay(valueB));
  },
  entre(valueA: Date, valueB: Date, valueC: Date): boolean {
    return isWithinInterval(startOfDay(valueA), { start: startOfDay(valueB), end: startOfDay(valueC) });
  },
};

export const ARRAY_COMPARATOR = {
  getter(v: any, key: string): any {
    return key ? v[key] : v;
  },
  comparator(valueA: any, valueB: any, key: string): (a: any) => boolean {
    let comparator = a => ARRAY_COMPARATOR.getter(a, key) === valueB;
    if (isArray(valueB)) {
      comparator = a => valueB?.includes?.(ARRAY_COMPARATOR.getter(a, key));
    }
    return comparator;
  },
  some(valueA: any[], valueB: any, key: string): boolean {
    const comparator = ARRAY_COMPARATOR.comparator(valueA, valueB, key);
    return valueA?.some(comparator);
  },
  every(valueA: any[], valueB: any, key: string): boolean {
    const comparator = ARRAY_COMPARATOR.comparator(valueA, valueB, key);
    return valueA?.every(comparator);
  },
};

export const awComparator = (
  dataType: AwFilterType,
  type: AwFilterConditionalTypes,
  value: any,
  term1: any,
  term2: any,
  key?: string
) => {
  switch (dataType) {
    case 'number':
      return NUMBER_COMPARATOR[type](value, term1, term2);
    case 'date':
      return DATE_COMPARATOR[type](value, term1, term2);
    case 'array':
      return ARRAY_COMPARATOR[type](value, term1, key);
    default:
      return TEXT_COMPARATOR[type](value, term1, term2);
  }
};

export const awFilter = <T>(array: T[], filterBy: AwFilterPipeProperties<T>) => {
  if (
    !array?.length ||
    !filterBy ||
    !isObject(filterBy) ||
    isEmpty(filterBy) ||
    Object.values(filterBy).every(v => !v)
    // Se todos os valores forem null, limpa o filtro
  ) {
    return array;
  }
  const entries = Object.entries<AwFilterPipeType>(filterBy).filter(([, value]) => value);
  return array.filter(item => {
    return entries.every(([key, value]) => {
      const property = item[key];
      if (value.filterType === 'conditional') {
        const { condition, term, term2, key: _key } = value.conditional;
        return awComparator(value.type, condition, property, term, term2, _key);
      } else {
        return awComparator('text', 'contem', '' + property, '' + value.term, null);
      }
    });
  });
};

export const AW_FILTER_POSITIONS: AwFilterPositions = {
  bottom: {
    offsetY: 15,
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
  },

  top: {
    offsetY: -15,
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom',
  },

  left: {
    offsetX: -15,
    originX: 'start',
    originY: 'center',
    overlayX: 'end',
    overlayY: 'center',
  },
  right: {
    offsetX: 15,
    originX: 'end',
    originY: 'center',
    overlayX: 'start',
    overlayY: 'center',
  },
};

export const getPositions = (position: AwFilterPosition): ConnectedPosition[] => {
  switch (position) {
    case 'top': {
      return [AW_FILTER_POSITIONS.top, AW_FILTER_POSITIONS.right, AW_FILTER_POSITIONS.bottom, AW_FILTER_POSITIONS.left];
    }
    case 'right':
      return [AW_FILTER_POSITIONS.right, AW_FILTER_POSITIONS.bottom, AW_FILTER_POSITIONS.left, AW_FILTER_POSITIONS.top];
    case 'left':
      return [AW_FILTER_POSITIONS.left, AW_FILTER_POSITIONS.top, AW_FILTER_POSITIONS.right, AW_FILTER_POSITIONS.bottom];
    default:
      return [AW_FILTER_POSITIONS.bottom, AW_FILTER_POSITIONS.left, AW_FILTER_POSITIONS.top, AW_FILTER_POSITIONS.right];
  }
};
