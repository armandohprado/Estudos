import { AwSelectBtnOptions, AwSelectComparatorFn } from './aw-select.type';
import { ConnectedPosition } from '@angular/cdk/overlay';

export const AW_SELECT_DEFAULT_PRIMARY_BTN: AwSelectBtnOptions = {
  status: 'primary',
};

export const AW_SELECT_DEFAULT_SECONDARY_BTN: AwSelectBtnOptions = {
  status: 'secondary',
  title: 'Limpar selecionado(s)',
  defaultAction: true,
};

export const AW_SELECT_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 2,
  },
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 2,
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -2,
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -2,
  },
];

export const awSelectComparatorFactory = <T>(
  key: keyof T
): AwSelectComparatorFn<T> => (valueA, valueB) =>
  valueA?.[key] === valueB?.[key];
