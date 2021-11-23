import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { AwComponentSize, AwComponentStatus, AwIcon, iconsPathMap } from '../util/types';
import { AwButtonWidth } from './aw-button.config';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { trackByFactory } from '@aw-utils/track-by';

export type AwButtonStatus = AwComponentStatus | 'info' | 'light' | 'dark' | 'ghost';

@Component({
  selector:
    'button[aw-button],button[awButton],a[awButton],input[type="button"][awButton],input[type="submit"][awButton]',
  templateUrl: './aw-button.component.html',
  styleUrls: ['./aw-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'btn aw-btn' },
})
export class AwButtonComponent {
  static ngAcceptInputType_link: BooleanInput;
  static ngAcceptInputType_circle: BooleanInput;
  static ngAcceptInputType_loading: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_gradient: BooleanInput;
  static ngAcceptInputType_outline: BooleanInput;
  static ngAcceptInputType_block: BooleanInput;

  constructor(private renderer2: Renderer2, public elementRef: ElementRef<HTMLButtonElement>) {}

  private _block = false;
  private _disabled = false;
  private _outline = false;
  private _gradient = true;
  private _circle = false;
  private _icon?: string;
  private _link = false;

  @Input() status: AwButtonStatus = 'primary';
  @Input() size: AwComponentSize = 'md';
  @Input() width: AwButtonWidth;
  @Input() iconSize: number;
  @Input() tabindex: number | string = 0;

  iconPath?: string[];

  readonly trackByString = trackByFactory<string>();

  @Input()
  @HostBinding('class.btn-link')
  get link(): boolean {
    return this._link;
  }
  set link(link: boolean) {
    this._link = coerceBooleanProperty(link);
  }

  @Input()
  @HostBinding('class.btn-circle')
  get circle(): boolean {
    return this._circle;
  }
  set circle(circle: boolean) {
    this._circle = coerceBooleanProperty(circle);
  }

  @Input()
  get icon(): AwIcon | string {
    return this._icon;
  }
  set icon(icon: AwIcon | string) {
    if (icon) {
      if (!icon.includes('icon')) {
        icon = 'icon-' + icon;
      }
      this.iconPath = iconsPathMap.get(icon as AwIcon);
      this._icon = 'icon ' + icon;
    } else {
      this._icon = null;
    }
  }

  @HostBinding('class.btn-icon')
  get classIcon(): boolean {
    return !!this._icon;
  }

  @Input()
  @HostBinding('class.loading')
  set loading(loading: boolean) {
    this._loading = loading;
    this.renderer2.setProperty(this.elementRef.nativeElement, 'disabled', loading || this._disabled);
  }
  get loading(): boolean {
    return this._loading;
  }
  private _loading: boolean;

  @HostBinding('class.aw-btn-primary')
  get widthPrimary(): boolean {
    return this.width === 'primary';
  }

  @HostBinding('class.aw-btn-secondary')
  get widthSecondary(): boolean {
    return this.width === 'secondary';
  }

  @HostListener('click', ['$event'])
  onClick($event: Event): void {
    if (this._disabled) {
      $event.preventDefault();
      $event.stopImmediatePropagation();
    }
  }

  @HostBinding('attr.tabindex')
  get tabindexAttr(): number | string {
    return this._disabled ? -1 : this.tabindex;
  }

  @Input()
  @HostBinding('attr.aria-disabled')
  @HostBinding('class.btn-disabled')
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._disabled = coerceBooleanProperty(disabled);
    this.renderer2.setProperty(this.elementRef.nativeElement, 'disabled', this._disabled || this._loading);
  }

  @Input()
  @HostBinding('class.gradient-btn')
  get gradient(): boolean {
    return this._gradient;
  }
  set gradient(gradient: boolean) {
    this._gradient = coerceBooleanProperty(gradient);
  }

  @Input()
  set outline(outline: boolean) {
    this._outline = coerceBooleanProperty(outline);
    if (this._outline) {
      this.renderer2.addClass(this.elementRef.nativeElement, 'btn-outline-' + this.status);
    } else {
      this.renderer2.removeClass(this.elementRef.nativeElement, 'btn-outline-' + this.status);
    }
  }

  @Input()
  @HostBinding('class.btn-block')
  get block(): boolean {
    return this._block;
  }
  set block(block: boolean) {
    this._block = coerceBooleanProperty(block);
  }

  @HostBinding('class.btn-xs')
  get xs(): boolean {
    return this.size === 'xs';
  }

  @HostBinding('class.btn-sm')
  get sm(): boolean {
    return this.size === 'sm';
  }

  @HostBinding('class.btn-lg')
  get lg(): boolean {
    return this.size === 'lg';
  }

  @HostBinding('class.btn-primary')
  get primary(): boolean {
    return this.isStatus('primary');
  }

  @HostBinding('class.btn-secondary')
  get secondary(): boolean {
    return this.isStatus('secondary');
  }

  @HostBinding('class.btn-success')
  get success(): boolean {
    return this.isStatus('success');
  }

  @HostBinding('class.btn-danger')
  get danger(): boolean {
    return this.isStatus('danger');
  }

  @HostBinding('class.btn-warning')
  get warning(): boolean {
    return this.isStatus('warning');
  }

  @HostBinding('class.btn-info')
  get info(): boolean {
    return this.isStatus('info');
  }

  @HostBinding('class.btn-light')
  get light(): boolean {
    return this.isStatus('light');
  }

  @HostBinding('class.btn-dark')
  get dark(): boolean {
    return this.isStatus('dark');
  }

  @HostBinding('class.btn-ghost')
  get ghost(): boolean {
    return this.isStatus('ghost');
  }

  get nativeElement(): HTMLButtonElement {
    return this.elementRef.nativeElement;
  }

  private isStatus(status: AwButtonStatus): boolean {
    return status === this.status && !this._outline && !this._icon && !this.link;
  }
}
