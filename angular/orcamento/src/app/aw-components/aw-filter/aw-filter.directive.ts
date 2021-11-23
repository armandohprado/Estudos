import {
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef, ScrollStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { AwFilterComponent } from './aw-filter.component';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AwFilterConditional, AwFilterPosition, AwFilterType } from './aw-filter.type';
import { isNil } from 'lodash-es';
import { getPositions } from './aw-filter.util';
import { Order } from '../aw-utils/aw-order-by/aw-order-by';

@Directive({
  selector: '[awFilter]',
})
export class AwFilterDirective implements OnInit, OnDestroy {
  constructor(private elementRef: ElementRef, private overlay: Overlay) {}

  private _destroy$ = new Subject<void>();
  private _destroyComponent$ = new Subject<void>();

  overlayRef: OverlayRef;
  component: ComponentPortal<AwFilterComponent>;

  @Input() position: AwFilterPosition = 'bottom';

  @Input() emitOnInit = true;
  @Input() type: AwFilterType;
  @Input() sortable: boolean;
  @Input() ascText: string;
  @Input() descText: string;
  @Input() filterable: boolean;
  @Input() filterBy: string;
  @Input() debounceFilter: number;
  @Input() conditionalFilterable: boolean;
  @Input() debounceConditional: number;
  @Input() sort: Order;
  @Output() sortChanged = new EventEmitter<Order>();
  @Input() filter: string;
  @Output() filterChanged = new EventEmitter<string>();
  @Input() conditional: AwFilterConditional<string | number | Date>;
  @Output() conditionalChanged = new EventEmitter<AwFilterConditional<string | number | Date>>();
  @Input() scrollStrategy: ScrollStrategy;

  componentRef: ComponentRef<AwFilterComponent>;

  @HostListener('click')
  onClick(): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.scrollStrategy ?? this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef.nativeElement)
        .withPositions(this.getPosition()),
    });
    this.overlayRef
      .backdropClick()
      .pipe(take(1), takeUntil(this._destroy$))
      .subscribe(() => {
        this.overlayRef.detach();
        this.destroyComponent();
      });
    this.overlayRef
      .detachments()
      .pipe(take(1), takeUntil(this._destroy$))
      .subscribe(() => {
        this.destroyComponent();
      });
    this.componentRef = this.overlayRef.attach(this.component);
    this.setComponentInputs(this.componentRef);
  }

  private setComponentInputs(componentRef: ComponentRef<AwFilterComponent>): void {
    if (!componentRef) return;
    const setProperty = (property: keyof AwFilterComponent, value: any): void =>
      !isNil(value) ? ((componentRef.instance as any)[property] = value) : '';
    setProperty('_type', this.type);
    setProperty('_filter', this.filter);
    setProperty('_conditional', this.conditional);
    setProperty('sort', this.sort);
    setProperty('conditionalFilterable', this.conditionalFilterable);
    setProperty('filterable', this.filterable);
    setProperty('sortable', this.sortable);
    setProperty('ascText', this.ascText);
    setProperty('descText', this.descText);
    setProperty('filterBy', this.filterBy);
    setProperty('debounceFilter', this.debounceFilter);
    setProperty('debounceConditional', this.debounceConditional);
    setProperty('emitOnInit', this.emitOnInit);
    componentRef.instance.sortChanged
      .pipe(takeUntil(this._destroyComponent$))
      .subscribe($event => this.sortChanged.emit($event));
    componentRef.instance.filterChanged
      .pipe(takeUntil(this._destroyComponent$))
      .subscribe($event => this.filterChanged.emit($event));
    componentRef.instance.conditionalChanged.pipe(takeUntil(this._destroyComponent$)).subscribe($event => {
      this.conditionalChanged.emit($event);
    });
  }

  private destroyComponent(): void {
    this._destroyComponent$.next();
    this.componentRef = null;
  }

  private getPosition(): ConnectedPosition[] {
    return getPositions(this.position);
  }

  ngOnInit(): void {
    this.component = new ComponentPortal(AwFilterComponent);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.destroyComponent();
    this._destroyComponent$.complete();
  }
}
