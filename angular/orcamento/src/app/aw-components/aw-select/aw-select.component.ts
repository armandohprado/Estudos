import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TrackByFunction,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ConnectedPosition, Overlay, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { BehaviorSubject, MonoTypeOperatorFunction, Observable, Subject } from 'rxjs';
import { isArray, isFunction, isNil, isObject, isString, isUndefined } from 'lodash-es';
import {
  AwSelectBindLabel,
  AwSelectBtnClickEvent,
  AwSelectComparatorFn,
  AwSelectFooterOptions,
  AwSelectHeaderOptions,
  AwSelectKeydownEnum,
  AwSelectOption,
  AwSelectPosition,
} from './aw-select.type';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs/operators';
import { compare, SearchType } from '../aw-utils/aw-search/aw-search.pipe';
import {
  AW_SELECT_DEFAULT_PRIMARY_BTN,
  AW_SELECT_DEFAULT_SECONDARY_BTN,
  AW_SELECT_POSITIONS,
} from './aw-select.config';
import { ValueFormatterPipe } from '@aw-shared/pipes/value-formatter.pipe';
import { AwInputStatus } from '../aw-input/aw-input.type';
import { AwComponentSize } from '../util/types';
import { DOCUMENT } from '@angular/common';
import { orderBy, OrderByType } from '../aw-utils/aw-order-by/aw-order-by';
import { KeyCode } from '@aw-models/key-code.enum';
import { findRight } from '@aw-utils/util';
import { AwButtonComponent } from '../aw-button/aw-button.component';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

let uniqueId = 0;

@Component({
  selector: 'aw-select',
  exportAs: 'aw-select',
  templateUrl: './aw-select.component.html',
  styleUrls: ['./aw-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AwSelectComponent), multi: true },
    ValueFormatterPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwSelectComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {
  static ngAcceptInputType_multiple: BooleanInput;
  static ngAcceptInputType_footer: BooleanInput;
  static ngAcceptInputType_header: BooleanInput;

  constructor(
    private overlay: Overlay,
    private valueFormatterPipe: ValueFormatterPipe,
    private scrollStrategyOptions: ScrollStrategyOptions,
    @Inject(DOCUMENT) private document: Document,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private _itemDisabled?: (item: AwSelectOption) => boolean;

  id = 'aw-select' + uniqueId++;

  awSelectKeydownEnum = AwSelectKeydownEnum;

  keyDownSub = new Subject<[$event: KeyboardEvent, active: AwSelectOption, items: AwSelectOption[]]>();

  @Input() minWidthPane = 200;

  @Input() primaryDisabled = false;
  @Input() secondaryDisabled = false;

  @Input() isInvalid = false;
  @Input() pageDownJump = 8;
  @Input() pageUpJump = 8;
  @Input() throttleKeydownTime = 60;

  private _destroy$ = new Subject<void>();

  private __items$ = new BehaviorSubject<AwSelectOption[]>([]);
  get __items(): AwSelectOption[] {
    return [...this.__items$.value];
  }
  _items$ = this.__items$.asObservable().pipe(this.distinctUntilChangedMultiple());
  _selectedItem$ = this._items$.pipe(
    map(items => items.find(item => item.selected)),
    this.distinctUntilChanged()
  );
  _selectedItems$ = this._items$.pipe(
    map(items => items.filter(item => item.selected)),
    this.distinctUntilChangedMultiple()
  );
  _hasSelected$ = this._selectedItem$.pipe(map(item => !!item));
  get _selectedItemSnapshot(): AwSelectOption {
    return this.__items.find(item => item.selected);
  }
  _activeItem$ = this._items$.pipe(
    map(items => items.find(item => item.active)),
    this.distinctUntilChanged()
  );
  _totalSelected$ = this._items$.pipe(
    map(items => items.filter(item => item.selected).length),
    distinctUntilChanged()
  );

  _rect: DOMRect;

  private _originValue: any | any[];
  value: any | any[];
  isOpen = false;

  searchControl = new FormControl(null);
  search$: Observable<string>;

  @ViewChild('trigger') elementRef: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput') searchRef: ElementRef<HTMLInputElement>;
  @ViewChild('primaryBtn') primaryBtnRef: AwButtonComponent;
  @ViewChild('secondaryBtn') secondaryBtnRef: AwButtonComponent;
  @ViewChildren('items') itemsRef: QueryList<ElementRef<HTMLDivElement>>;

  @HostBinding('attr.disabled')
  get isDisabled(): boolean {
    return this.disabled;
  }

  @Input('disabled')
  set _disabled(disabled: '' | boolean) {
    this.disabled = coerceBooleanProperty(disabled);
  }
  disabled: boolean;

  @Input() scrollStrategy: ScrollStrategy = this.scrollStrategyOptions.block();
  @Input() noDataFound = 'Nenhum item encontrado';
  @Input() bindValue: string;
  @Input() closeOnSelect = true;
  @Input() clearSearch = true;
  @Input() clearable = true;
  @Input() searchable = true;
  @Input() searchBy: SearchType<any>;
  @Input() maxSelectedItems: number;
  @Input() loading: boolean;
  @Input() placeholder: string;
  @Input() showTooltip: boolean;
  @Input() loadingText = 'Carregando...';
  @Input() searchPlaceholder = 'Pesquisar';
  @Input() selectOnEnter = true;
  @Input() selectOnTab = false;
  @Input() focusOnFirstItem = true;
  @Input() selectedText = 'item';
  @Input() selectedTextPlural = 'itens';
  @Input() bindLabelSeparator = ' ';
  @Input() useBindValueOnOutputs = true;
  @Input() useBindValueOnComparator = false;
  @Input() showSelected = false; // beta
  @Input() maxWidthBadge = '5rem';
  @Input('position')
  set _position(position: AwSelectPosition) {
    if (position === 'auto') {
      this.position = AW_SELECT_POSITIONS;
    } else {
      this.position = AW_SELECT_POSITIONS.filter(pos => pos.originY === position);
    }
  }
  position: ConnectedPosition[] = AW_SELECT_POSITIONS;

  @Input('status')
  set _status(status: AwInputStatus) {
    this.status = status;
    this.loading = status === 'loading';
  }
  status: AwInputStatus;

  @Input() size: AwComponentSize;

  @Input()
  get header(): boolean {
    return this._header;
  }
  set header(header: boolean) {
    this._header = coerceBooleanProperty(header);
  }
  private _header: boolean;
  @Input() headerOptions: AwSelectHeaderOptions = {
    totalItems: true,
    totalSelected: true,
    maxSelected: true,
  };

  @Input()
  get footer(): boolean {
    return this._footer;
  }
  set footer(footer: boolean) {
    this._footer = coerceBooleanProperty(footer);
  }
  private _footer: boolean;

  @Input('footerOptions')
  set _footerOptions(footerOptions: AwSelectFooterOptions) {
    this.footerOptions = {
      secondaryBtn: {
        ...AW_SELECT_DEFAULT_SECONDARY_BTN,
        ...footerOptions?.secondaryBtn,
      },
      primaryBtn: {
        ...AW_SELECT_DEFAULT_PRIMARY_BTN,
        ...footerOptions?.primaryBtn,
      },
    };
  }
  footerOptions: AwSelectFooterOptions = {
    secondaryBtn: AW_SELECT_DEFAULT_SECONDARY_BTN,
  };

  @Input() orderBy: OrderByType<any>;

  @Input()
  set searchDebounce(debounce: number) {
    this._searchDebounce = debounce;
  }
  _searchDebounce = 400;

  @Input()
  set multiple(multiple: boolean) {
    this._multiple = coerceBooleanProperty(multiple);
    this._clear();
  }
  _multiple: boolean;

  @Input() set items(items: any[]) {
    this._originItems = items ?? [];
    this.setItems(items ?? []);
  }
  private _originItems: any[] = [];

  // tslint:disable:no-output-native
  @Output() select = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
  @Output() blur = new EventEmitter();
  @Output() search = new EventEmitter<string>();
  @Output() open = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() primaryBtn = new EventEmitter<AwSelectBtnClickEvent>();
  @Output() secondaryBtn = new EventEmitter<AwSelectBtnClickEvent>();
  @Output() attachOverlay = new EventEmitter<HTMLDivElement>();
  // tslint:enable:no-output-native

  private compareOption(oldItem: AwSelectOption, newItem: AwSelectOption): boolean {
    return (
      oldItem?.active === newItem?.active &&
      oldItem?.disabled === newItem?.disabled &&
      oldItem?.selected === newItem?.selected &&
      oldItem?.index === newItem?.index &&
      this.comparate(oldItem?.data, newItem?.data)
    );
  }

  private distinctUntilChangedMultiple(): MonoTypeOperatorFunction<AwSelectOption[]> {
    return distinctUntilChanged((oldValue, newValue) => {
      if (oldValue?.length !== newValue?.length) {
        return false;
      }
      for (let i = 0, len = newValue.length; i < len; i++) {
        if (!this.compareOption(oldValue[i], newValue[i])) {
          return false;
        }
      }
      return true;
    });
  }

  private distinctUntilChanged(): MonoTypeOperatorFunction<AwSelectOption> {
    return distinctUntilChanged((oldItem, newItem) => {
      return this.compareOption(oldItem, newItem);
    });
  }

  private setItemsDisabled(items: AwSelectOption[]): AwSelectOption[] {
    if (!this._itemDisabled) {
      return items;
    }
    return items.map(item => ({ ...item, disabled: this._itemDisabled(item) }));
  }

  private setItems(items: any[]): void {
    if (!this._multiple || (this._multiple && !this.value?.length)) {
      this.value = this.getValue(this._originValue);
      this.changeDetectorRef.markForCheck();
    }
    if (this.orderBy) {
      items = orderBy(items, this.orderBy);
    }
    const newItems: AwSelectOption[] = [...items].map((data, index) => ({
      data,
      index,
      selected: this.isSelected(data),
    }));
    this.__items$.next(this.setItemsDisabled(newItems));
  }

  @Input()
  set trackBy(trackBy: string | TrackByFunction<any>) {
    if (isFunction(trackBy)) {
      this._trackBy = (index, element) => trackBy(index, element.data);
    } else if (isString(trackBy)) {
      this._trackBy = (index, element): number =>
        element ? (element.data ? element.data[trackBy] : element.index) : index;
    }
  }
  _trackBy: TrackByFunction<AwSelectOption> = (index, item) => item.index;

  @Input()
  set itemDisabled(fnOrKey: ((item: AwSelectOption) => boolean) | string) {
    if (isString(fnOrKey)) {
      this._itemDisabled = item => item.data[fnOrKey];
    } else {
      this._itemDisabled = fnOrKey;
    }
  }

  @Input() bindLabel: AwSelectBindLabel = value => value;
  @Input() comparatorFn: AwSelectComparatorFn = (val1, val2) => {
    if (this.bindValue) {
      if (!isObject(val1)) {
        return val1 === val2?.[this.bindValue];
      } else {
        return val1?.[this.bindValue] === val2?.[this.bindValue];
      }
    } else {
      return val1 === val2;
    }
  };

  onChange: any = () => {};
  _onTouched: any = () => {};

  onTouched(): void {
    this._onTouched();
    this.blur.emit();
  }

  private comparate(valueA: any, valueB: any): boolean {
    if (this.useBindValueOnComparator) {
      valueA = this.realValue(valueA);
      valueB = this.realValue(valueB);
    }
    return this.comparatorFn(valueA, valueB);
  }

  private _update(
    index: number | ((item: AwSelectOption, index: number) => boolean),
    partial: Partial<AwSelectOption> | ((options: AwSelectOption, index: number) => AwSelectOption)
  ): void {
    const predicate = isFunction(index) ? index : (option: AwSelectOption) => option.index === index;
    const callback = isFunction(partial) ? partial : (option: AwSelectOption) => ({ ...option, ...partial });
    this.__items$.next(
      this.setItemsDisabled(
        this.__items.map((option, idx) => {
          if (predicate(option, idx)) {
            option = callback(option, idx);
          }
          return option;
        })
      )
    );
  }

  private _map(callback: (item: AwSelectOption, index: number) => AwSelectOption): void {
    this._update(() => true, callback);
  }

  private realValue(val: any): any {
    return this.bindValue ? val?.[this.bindValue] : val;
  }

  private outputValue(val: any, multiple = false): any {
    if (multiple) {
      if (this.useBindValueOnOutputs) {
        return val.map(o => this.realValue(o));
      }
    }
    return this.useBindValueOnOutputs ? this.realValue(val) : val;
  }

  private isSelected(data: any): boolean {
    if (this._multiple && isArray(this.value)) {
      return this.value.some(val => {
        return this.comparate(val, data);
      });
    } else {
      return this.comparate(this.value, data);
    }
  }

  onClick(item: AwSelectOption, $event: boolean): void {
    if ($event) {
      this._select(item);
    } else {
      this._unselect(item);
    }
  }

  _clear(): void {
    if (isNil(this.value) || (this._multiple && !this.value?.length)) {
      return;
    }
    this.clear.emit();
    this._update(item => item.selected, { selected: false });
    this._onChange(this._multiple ? [] : null);
    this._onTouched();
  }

  _select(item: AwSelectOption): void {
    if (item.selected || item.disabled) {
      if (this.closeOnSelect) {
        this._close();
      }
      return;
    }
    if (this._multiple) {
      if (this.maxSelectedItems && this.value?.length === this.maxSelectedItems) {
        return;
      }
      this._update(item.index, { selected: true });
    } else {
      this._update(
        option => option.selected || option.index === item.index,
        option => ({
          ...option,
          selected: option.index === item.index,
        })
      );
    }
    this._onAdd(item.data);
    this.select.emit(this.outputValue(item.data));
    if (this.closeOnSelect) this._close();
    if (this.clearSearch) this.searchControl.setValue(null);
  }

  _unselect(item: AwSelectOption): void {
    if (!this._multiple) {
      if (this.closeOnSelect) {
        this._close();
      }
      return;
    }
    this.remove.emit(this.outputValue(item.data));
    this._update(item.index, { selected: false });
    this._onChange(
      this.__items
        .filter(({ selected }) => selected)
        .filter(data => data.index !== item.index)
        .map(({ data }) => data)
    );
    if (this.closeOnSelect) this._close();
  }

  _unselectAll(): void {
    if (!this._multiple) return;
    this._update(item => item.selected, { selected: false });
    this._onChange([]);
    this._originValue = [];
  }

  _selectAll(): void {
    if (!this._multiple) {
      return;
    }
    this._update(
      () => true,
      option => ({ ...option, selected: !option.disabled })
    );
    this._onChange(this.__items.filter(option => !option.disabled).map(option => option.data));
  }

  toggle(): void {
    if (this.isOpen) {
      this._close();
    } else {
      this._open();
    }
  }

  private _onAdd(value: any): void {
    if (this._multiple) {
      this._onChange([...(this.value ?? []), value]);
    } else {
      this._onChange(value);
    }
  }

  private _onChange(value: any): void {
    let changedValue = value;
    if (this.bindValue && !!value) {
      if (this._multiple) {
        changedValue = value.map(val => val[this.bindValue]);
      } else {
        changedValue = value[this.bindValue];
      }
    }
    this.onChange(changedValue);
    this.value = value;
    this._originValue = value;
    this.changeDetectorRef.markForCheck();
  }

  private _checkModal(): void {
    if (!this.scrollStrategy) {
      if (this.document.querySelector('modal-container')) {
        this.scrollStrategy = this.scrollStrategyOptions.reposition({
          autoClose: true,
        });
      } else {
        this.scrollStrategy = this.scrollStrategyOptions.block();
      }
      this.changeDetectorRef.markForCheck();
    }
  }

  _open(): void {
    this._rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.isOpen = true;
    this.open.emit();
    setTimeout(() => {
      if (this.searchable) this.searchRef?.nativeElement.focus();
    });
    this.changeDetectorRef.markForCheck();
  }

  private _setRefToOption(): void {
    if (this.isOpen) {
      const arrayRef = this.itemsRef.toArray();
      this._map(item => ({
        ...item,
        element: arrayRef.find(element => element.nativeElement.id === '' + item.index),
      }));
    }
  }

  _close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.onTouched();
    this._update(item => item.active, { active: false });
    this.close.emit();
    this.changeDetectorRef.markForCheck();
  }

  backdropClick($event: MouseEvent): void {
    $event.stopPropagation();
    this._close();
  }

  onKeydown($event: KeyboardEvent, type: AwSelectKeydownEnum, items: AwSelectOption[], active?: AwSelectOption): void {
    switch ($event.key) {
      case KeyCode.PageDown:
      case KeyCode.PageUp:
      case KeyCode.Home:
      case KeyCode.End:
      case KeyCode.ArrowUp:
      case KeyCode.ArrowDown:
      case KeyCode.ArrowLeft:
      case KeyCode.ArrowRight: {
        $event.preventDefault();
        this.keyDownSub.next([$event, active, items]);
        break;
      }
      case KeyCode.Tab: {
        if (this.selectOnTab) {
          if (active) {
            if (active.selected) {
              this._unselect(active);
            } else {
              this._select(active);
            }
          }
        } else if (this.footer) {
          if (this.secondaryBtnRef && this.document.activeElement !== this.secondaryBtnRef.elementRef.nativeElement) {
            this.secondaryBtnRef.elementRef.nativeElement.focus();
            this.removeActive();
          } else if (
            this.primaryBtnRef &&
            this.document.activeElement !== this.primaryBtnRef.elementRef.nativeElement
          ) {
            this.primaryBtnRef.elementRef.nativeElement.focus();
            this.removeActive();
          }
        }
        $event.preventDefault();
        break;
      }
      case KeyCode.Enter: {
        if (this.selectOnEnter && active) {
          $event.preventDefault();
          if (active.selected) {
            this._unselect(active);
          } else {
            this._select(active);
          }
        }
        break;
      }
      default: {
        if (type === AwSelectKeydownEnum.overlay && this.searchable && isKeySearch($event.key)) {
          this.searchRef?.nativeElement?.focus();
        }
        break;
      }
    }
  }

  private onKeydownSub([$event, active, items]: [KeyboardEvent, AwSelectOption, AwSelectOption[]]): void {
    switch ($event.key) {
      case KeyCode.PageDown:
        this.onPageDown([active, items]);
        break;
      case KeyCode.PageUp:
        this.onPageUp([active, items]);
        break;
      case KeyCode.Home:
        this.onHome(items);
        break;
      case KeyCode.End:
        this.onEnd(items);
        break;
      case KeyCode.ArrowUp:
        this.onArrowUp([active, items]);
        break;
      case KeyCode.ArrowDown:
        this.onArrowDown([active, items]);
        break;
      case KeyCode.ArrowLeft:
        this.onArrowLeft();
        break;
      case KeyCode.ArrowRight:
        this.onArrowRight();
        break;
    }
  }

  private onArrowDown([active, items]: [AwSelectOption, AwSelectOption[]]): void {
    if (!active) {
      const first = items.find(item => !item.disabled);
      if (first) {
        first.element.nativeElement.focus();
        this.setActive(first.index);
      }
    } else {
      const nextItem = items.find(item => !item.disabled && item.index > active.index);
      if (nextItem) {
        nextItem.element.nativeElement.focus();
        this.setActive(nextItem.index);
      }
    }
  }

  private onPageDown([active, items]: [AwSelectOption, AwSelectOption[]]): void {
    if (active) {
      const nextItem = items
        .filter(item => !item.disabled && item.index > active.index)
        .find((_, index, array) => index > this.pageDownJump - 1 || index === array.length - 1);
      if (nextItem && nextItem.index !== active.index) {
        nextItem.element.nativeElement.focus();
        this.setActive(nextItem.index);
      }
    }
  }

  private onPageUp([active, items]: [AwSelectOption, AwSelectOption[]]): void {
    if (active) {
      const itemsEnabled = items.filter(item => !item.disabled && item.index < active.index);
      let nextIndex = itemsEnabled.length - this.pageUpJump - 1;
      nextIndex = nextIndex > -1 ? nextIndex : 0;
      const nextItem = itemsEnabled[nextIndex];
      if (nextItem && nextItem.index !== active.index) {
        nextItem.element.nativeElement.focus();
        this.setActive(nextItem.index);
      }
    }
  }

  private onEnd(items: AwSelectOption[]): void {
    const nextItem = findRight(items, item => !item.disabled);
    if (nextItem) {
      nextItem.element.nativeElement.focus();
      this.setActive(nextItem.index);
    }
  }

  private onHome(items: AwSelectOption[]): void {
    const nextItem = items.find(item => !item.disabled);
    if (nextItem) {
      nextItem.element.nativeElement.focus();
      this.setActive(nextItem.index);
    }
  }

  private onArrowUp([active, items]: [AwSelectOption, AwSelectOption[]]): void {
    if (!active) {
      const item = findRight(items, it => !it.disabled);
      if (item) {
        item.element.nativeElement.focus();
        this.setActive(item.index);
      }
    } else {
      const nextItem = findRight(items, it => !it.disabled && it.index < active.index);
      if (nextItem) {
        nextItem.element.nativeElement.focus();
        this.setActive(nextItem.index);
      }
    }
  }

  private onArrowLeft(): void {
    if (this.footer) {
      if (this.secondaryBtnRef && this.primaryBtnRef?.elementRef.nativeElement === this.document.activeElement) {
        this.secondaryBtnRef.elementRef.nativeElement.focus();
      }
    }
  }

  private onArrowRight(): void {
    if (this.footer) {
      if (this.primaryBtnRef && this.secondaryBtnRef?.elementRef.nativeElement === this.document.activeElement) {
        this.primaryBtnRef.elementRef.nativeElement.focus();
      }
    }
  }

  setActive(index: number): void {
    this._update(
      item => item.active || item.index === index,
      item => ({ ...item, active: item.index === index })
    );
  }

  removeActive(): void {
    this._update(item => item.active, { active: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  writeValue(obj: any): void {
    if (this._multiple && !isArray(obj)) {
      obj = [];
    }
    this.value = this.getValue(obj);
    this._originValue = obj;
    this.setItems(this._originItems ?? []);
    this.changeDetectorRef.markForCheck();
  }

  private getValue(val: any): any {
    if (isUndefined(val)) return val;
    if (this.bindValue) {
      if (isArray(val) && this._multiple) {
        return val
          .map(v => {
            return this._originItems.find(origin => {
              return this.comparate(v, origin);
            });
          })
          .filter(v => !isNil(v));
      } else {
        return this._originItems.find(origin => this.comparate(val, origin));
      }
    }
    return val;
  }

  private setSearchBy(): void {
    if (!this.searchBy) {
      if (this.bindLabel && (isString(this.bindLabel) || isArray(this.bindLabel))) {
        this.searchBy = this.bindLabel;
      } else {
        this.searchBy = (value, term) => {
          return compare(this.valueFormatterPipe.transform(value, this.bindLabel as any), term);
        };
      }
      this.changeDetectorRef.markForCheck();
    }
  }

  private enableBtn(btn: 'primary' | 'secondary'): (enabled: boolean) => void {
    return (enabled: boolean) => {
      this[btn + 'Disabled'] = !enabled;
      this.changeDetectorRef.markForCheck();
    };
  }

  onPrimaryClick(event: MouseEvent | KeyboardEvent): void {
    event.stopPropagation();
    this.primaryBtn.emit({
      data: this.outputValue(this.value, this._multiple),
      event,
      enableBtn: this.enableBtn('primary').bind(this),
    });
  }

  onSecondaryClick(event: MouseEvent | KeyboardEvent): void {
    event.stopPropagation();
    if (this.footerOptions?.secondaryBtn?.defaultAction) {
      this._unselectAll();
    }
    this.secondaryBtn.emit({
      data: this.outputValue(this.value, this._multiple),
      event,
      enableBtn: this.enableBtn('secondary').bind(this),
    });
  }

  onAttach(): void {
    this.attachOverlay.emit(this.document.documentElement.querySelector('.cdk-overlay-backdrop.aw-select-backdrop'));
  }

  private _checkItemsRef(): void {
    this.itemsRef.changes
      .pipe(
        takeUntil<QueryList<ElementRef<HTMLDivElement>>>(this._destroy$),
        filter(() => this.isOpen),
        tap(() => {
          this._setRefToOption();
        }),
        map(list => [...list]),
        delay(10)
      )
      .subscribe(newElements => {
        const itemSelected = this._selectedItemSnapshot;
        const searchHasValue = !!this.searchControl.value;
        if (this.focusOnFirstItem && (!itemSelected || searchHasValue)) {
          const items = this.__items;
          const itemsSearch = newElements.map(el => items.find(it => '' + it.index === el.nativeElement.id));
          const first = itemsSearch.find(it => !it.disabled);
          if (first) {
            first.element.nativeElement.focus();
            this.setActive(first.index);
          }
        } else if (itemSelected) {
          newElements.find(el => el.nativeElement.id === '' + itemSelected.index)?.nativeElement.focus();
          this.setActive(itemSelected.index);
        }
        this.changeDetectorRef.markForCheck();
      });
  }

  originSpaceKeyDown($event: KeyboardEvent): void {
    if (!this.isOpen) {
      $event.preventDefault();
      this._open();
    }
  }

  ngOnInit(): void {
    this.setSearchBy();
    this.primaryDisabled = !!this.footerOptions?.primaryBtn?.disabled;
    this.secondaryDisabled = !!this.footerOptions?.secondaryBtn?.disabled;
    this.search$ = this.searchControl.valueChanges.pipe(
      takeUntil<string>(this._destroy$),
      debounceTime(this._searchDebounce),
      tap(term => {
        if (this.isOpen) {
          this.search.emit(term);
        }
      }),
      shareReplay()
    );
    this.keyDownSub
      .asObservable()
      .pipe(takeUntil(this._destroy$), throttleTime(this.throttleKeydownTime || 60))
      .subscribe(this.onKeydownSub.bind(this));
    this.changeDetectorRef.markForCheck();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._checkModal();
      this._checkItemsRef();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

export function isKeySearch(key: string): boolean {
  return /^(\w|Space|Backspace)$/.test(key);
}
