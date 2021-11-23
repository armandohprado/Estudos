import {
  AfterViewInit,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { AwSpinnerSize } from './aw-spinner.types';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { AwSpinnerComponent } from '@aw-components/aw-spinner/aw-spinner.component';

@Directive({
  selector: '[awSpinner]',
  host: { '[style.position]': `'relative'` },
})
export class AwSpinnerDirective implements OnInit, AfterViewInit {
  static ngAcceptInputType_useMinHeight: BooleanInput;
  static ngAcceptInputType_awSpinner: BooleanInput;
  static ngAcceptInputType_noBackground: BooleanInput;

  constructor(
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private renderer2: Renderer2
  ) {}

  private _show = false;

  @Input()
  set useMinHeight(useMinHeight: boolean) {
    this._useMinHeight = coerceBooleanProperty(useMinHeight);
  }
  private _useMinHeight = false;

  componentRef: ComponentRef<AwSpinnerComponent>;
  componentFactory: ComponentFactory<AwSpinnerComponent>;

  @Input()
  set awSpinner(show: boolean) {
    this._show = show;
    if (show) this.show();
    else this.hide();
  }

  @HostBinding('style.min-height.px')
  get minHeightStyle(): number {
    return this._useMinHeight && this._show ? 40 : null;
  }

  @Input()
  set size(size: AwSpinnerSize) {
    this._size = size;
    if (this.componentRef) {
      this.componentRef.instance.size = size;
      this.componentRef.changeDetectorRef.markForCheck();
    }
  }
  private _size: AwSpinnerSize;

  @Input()
  set noBackground(background: boolean) {
    this._noBackground = coerceBooleanProperty(background);
    if (this.componentRef) {
      this.componentRef.instance.noBackground = background;
      this.componentRef.changeDetectorRef.markForCheck();
    }
  }
  private _noBackground: boolean;

  @Input() set borderRadius(radius: string) {
    this._radius = radius;
    if (this.componentRef) {
      this.componentRef.instance.borderRadius = radius;
      this.componentRef.changeDetectorRef.markForCheck();
    }
  }
  private _radius = '0';

  show(): void {
    this._show = true;
    if (this.componentRef) {
      this.renderer2.appendChild(this.elementRef.nativeElement, this.componentRef.location.nativeElement);
      this.enableElement(false);
    }
  }

  hide(): void {
    this._show = false;
    if (this.componentRef) {
      this.renderer2.removeChild(this.elementRef.nativeElement, this.componentRef.location.nativeElement);
      this.enableElement(true);
    }
  }

  enableElement(enable: boolean): void {
    enable = coerceBooleanProperty(enable);
    if (enable) {
      this.renderer2.removeStyle(this.elementRef.nativeElement, 'pointer-events');
    } else {
      this.renderer2.setStyle(this.elementRef.nativeElement, 'pointer-events', 'none');
    }
    this.renderer2.setProperty(this.elementRef.nativeElement, 'disabled', !enable);
  }

  ngOnInit(): void {
    this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(AwSpinnerComponent);
    this.componentRef = this.viewContainerRef.createComponent(this.componentFactory);
    this.componentRef.instance.borderRadius = this._radius;
    this.componentRef.instance.size = this._size;
    this.componentRef.instance.noBackground = this._noBackground;
    this.componentRef.changeDetectorRef.markForCheck();
  }

  ngAfterViewInit(): void {
    if (this._show) {
      this.show();
    } else {
      this.hide();
    }
  }
}
