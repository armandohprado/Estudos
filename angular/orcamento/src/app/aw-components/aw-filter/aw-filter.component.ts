import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, skip, startWith, takeUntil, tap } from 'rxjs/operators';
import { isNil } from 'lodash-es';
import {
  AwFilterConditional,
  awFilterConditionalItems,
  AwFilterConditionalSelectItem,
  AwFilterConditionalTypes,
  AwFilterType,
} from './aw-filter.type';
import { Order } from '../aw-utils/aw-order-by/aw-order-by';
import { format, parseISO } from 'date-fns';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from 'ngx-currency';

@Component({
  selector: 'aw-filter',
  templateUrl: './aw-filter.component.html',
  styleUrls: ['./aw-filter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AwFilterComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(private renderer2: Renderer2) {}

  private _destroy$ = new Subject<void>();

  private _items = new BehaviorSubject<ReadonlyArray<AwFilterConditionalSelectItem<string | number | Date>>>(
    awFilterConditionalItems
  );
  items = this._items.asObservable().pipe(
    map(items => {
      return items.filter(item => {
        return item.types.includes(this.type);
      });
    })
  );

  @Input('type') set _type(type: AwFilterType) {
    this.type = type;
    this.defineSelect();
  }
  type: AwFilterType;

  @Input() emitOnInit = false;

  @Input() sort: Order;
  @Input() sortable: boolean;
  @Input() ascText: string;
  @Input() descText: string;
  @Input('filter')
  set _filter(f: any) {
    this.filter = f;
    this.filterControl.setValue(f, { emitEvent: this.emitOnInit });
  }
  filter: any;
  @Input() filterable: boolean;
  @Input() filterBy: string;
  @Input() debounceFilter = 400;
  filterControl = new FormControl();

  @Input('conditional')
  set _conditional(conditional: AwFilterConditional<string | number | Date>) {
    if (conditional?.condition) {
      this.conditional = conditional;
      this.conditionalControl.setValue(
        this.type === 'date' && conditional.term ? format(new Date(conditional.term), 'yyyy-MM-dd') : conditional.term,
        {
          emitEvent: this.emitOnInit,
        }
      );
      this.conditional2Control.setValue(
        this.type === 'date' && conditional.term2
          ? format(new Date(conditional.term2), 'yyyy-MM-dd')
          : conditional.term2,
        {
          emitEvent: this.emitOnInit,
        }
      );
      this.conditionalSelectControl.setValue(conditional.condition, {
        emitEvent: this.emitOnInit,
      });
    }
  }
  conditional: AwFilterConditional<string | number | Date>;
  @Input() conditionalFilterable: boolean;
  conditionalSelectControl = new FormControl();
  conditionalControl = new FormControl();
  conditional2Control = new FormControl();
  conditionalSelect$: Observable<AwFilterConditionalTypes>;
  optionsCurrency: Partial<CurrencyMaskConfig> = {
    allowNegative: true,
    align: 'left',
    allowZero: true,
    nullable: true,
    inputMode: CurrencyMaskInputMode.NATURAL,
  };

  @Input() debounceConditional = 400;

  @Output() sortChanged = new EventEmitter<Order>();
  @Output() filterChanged = new EventEmitter<any>();
  @Output() conditionalChanged = new EventEmitter<AwFilterConditional<string | number | Date>>();

  private _unregisterEventListenerSelect = () => {};

  onSort(order: Order): void {
    this.sort = order;
    this.sortChanged.emit(order);
  }

  isEqual = (a, b) => a.condition === b.condition;

  private defineSelect(): void {
    if (!this.conditional?.condition) {
      switch (this.type) {
        case 'number':
        case 'date':
          this.conditionalSelectControl.setValue(awFilterConditionalItems[2].value);
          break;
        default:
          this.conditionalSelectControl.setValue(awFilterConditionalItems[0].value);
          break;
      }
    } else {
      this.conditionalSelectControl.enable();
    }
  }

  setDefaults(): void {
    const setDef = (property: keyof this, value: any) => (isNil(this[property]) ? (this[property] = value) : '');
    if (isNil(this.type)) {
      this._type = 'text';
    }
    setDef('sortable', true);
    setDef('ascText', 'Classificar A ⟶ Z');
    setDef('descText', 'Classificar Z ⟶ A');
    setDef('filterable', true);
    setDef('filterBy', 'Palavra');
    setDef('debounceFilter', 400);
    setDef('conditionalFilterable', true);
    setDef('debounceConditional', 400);
  }

  onSelectAttach(backdrop: HTMLDivElement): void {
    this._unregisterEventListenerSelect = this.renderer2.listen(backdrop, 'mousedown', $event =>
      $event.stopPropagation()
    );
  }

  private _disableConditional(disabled: boolean): void {
    this.conditionalControl[disabled ? 'disable' : 'enable']({
      emitEvent: false,
    });
    this.conditional2Control[disabled ? 'disable' : 'enable']({
      emitEvent: false,
    });
    this.conditionalSelectControl[disabled ? 'disable' : 'enable']({
      emitEvent: false,
    });
  }

  private _disableFilter(disabled: boolean): void {
    this.filterControl[disabled ? 'disable' : 'enable']({ emitEvent: false });
  }

  ngOnInit(): void {
    this.filterControl.setValue(this.filter);
    this._conditional = this.conditional;
    this.conditionalSelect$ = this.conditionalSelectControl.valueChanges;

    this.setDefaults();
    // Filter normal
    this.filterControl.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(this.debounceFilter),
        tap(value => {
          this.filterChanged.emit(value);
          this._disableConditional(true);
        }),
        filter(value => !value),
        tap(() => {
          this._disableConditional(false);
        })
      )
      .subscribe();

    // Conditional filter

    const control$ = this.conditionalControl.valueChanges.pipe(startWith(this.conditional?.term));
    const control2$ = this.conditional2Control.valueChanges.pipe(startWith(this.conditional?.term2));
    const toNumber = (term: number | string | null | undefined) => (isNil(term) ? null : Number(term));
    combineLatest([this.conditionalSelect$, control$, control2$])
      .pipe(
        debounceTime(this.debounceConditional),
        skip(1),
        takeUntil(this._destroy$),
        tap(([condition, term, term2]) => {
          if (this.type === 'date') {
            term = term ? parseISO(term) : term;
            term2 = term2 ? parseISO(term2) : term2;
          }
          if (this.type === 'number') {
            term = toNumber(term);
            term2 = toNumber(term2);
          }
          this.conditionalChanged.emit({ condition, term, term2 });
          this._disableFilter(true);
        }),
        filter(([_, term]) => !term),
        tap(() => {
          this._disableFilter(false);
        })
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.defineSelect());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._unregisterEventListenerSelect();
  }
}
