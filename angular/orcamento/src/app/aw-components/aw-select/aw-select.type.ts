import { AwComponentStatus } from '../util/types';
import { ElementRef } from '@angular/core';

export interface AwSelectOption<T = any> {
  index: number;
  selected: boolean;
  data: T;
  active?: boolean;
  disabled?: boolean;
  element?: ElementRef<HTMLDivElement>;
}

export interface AwSelectHeaderOptions {
  totalItems?: boolean;
  totalSelected?: boolean;
  maxSelected?: boolean;
}

export interface AwSelectBtnOptions {
  title?: string;
  status?: AwComponentStatus;
  disabled?: boolean;
  defaultAction?: boolean;
}

export interface AwSelectFooterOptions {
  primaryBtn?: AwSelectBtnOptions;
  secondaryBtn?: AwSelectBtnOptions;
}

export interface AwSelectBtnClickEvent<T = any> {
  data: T;
  event: MouseEvent | KeyboardEvent;
  enableBtn(enabled: boolean): void;
}

export enum AwSelectKeydownEnum {
  search,
  overlay,
}

export type AwSelectComparatorFn<T = any> = (valueA: T, valueB: T) => boolean;
export type AwSelectBindLabel = string | string[] | ((value: any) => string);
export type AwSelectPosition = 'auto' | 'top' | 'bottom';
