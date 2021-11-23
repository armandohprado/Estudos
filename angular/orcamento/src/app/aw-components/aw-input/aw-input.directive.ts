import {
  Directive,
  ElementRef,
  Host,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  Self,
} from '@angular/core';
import { AwComponentSize } from '../util/types';
import { AwInputStatus } from './aw-input.type';
import { NgControl, NgModel } from '@angular/forms';
import { AwSpinnerDirective } from '../aw-spinner/aw-spinner.directive';

@Directive({
  selector: ':not(input[type="checkbox"]):not(input[type="radio"])input[awInput],textarea[awInput]',
})
export class AwInputDirective implements OnDestroy, OnInit {
  constructor(
    private renderer2: Renderer2,
    private elementRef: ElementRef<HTMLInputElement | HTMLTextAreaElement>,
    @Self() @Optional() ngControl: NgControl,
    @Self() @Optional() ngModel: NgModel,
    @Host() @Optional() private awSpinnerDirective: AwSpinnerDirective
  ) {
    this._ngControl = ngControl || ngModel;
    this.renderer2.addClass(this.elementRef.nativeElement, 'form-control');
    this.renderer2.addClass(this.elementRef.nativeElement, 'aw-input');
  }

  @Input() resize: 'vertical' | 'horizontal' | 'both' | 'none';
  @Input() size: AwComponentSize;
  @Input() completedTime = 2000;
  @Input() emitEventOnLoading = false;

  private readonly _ngControl: NgControl | NgModel;
  private _status: AwInputStatus;
  private _timeoutCompletedTime: any;
  private _loading = false;

  @Input()
  set completed(completed: boolean) {
    if (completed) this.setCompleted();
  }

  setCompleted(): void {
    this.status = 'valid';
    this._timeoutCompletedTime = setTimeout(() => {
      this.status = null;
    }, this.completedTime);
  }

  @Input()
  set loading(loading: boolean) {
    this._loading = loading;
    this.setEnabled(loading);
    if (this.awSpinnerDirective) {
      if (loading) this.awSpinnerDirective.show();
      else this.awSpinnerDirective.hide();
    }
  }

  @Input()
  set status(status: AwInputStatus) {
    clearTimeout(this._timeoutCompletedTime);
    if (status === 'loading') {
      this.loading = true;
    } else {
      if (this.status === 'loading') {
        this.loading = false;
      }
      if (status === 'completed') {
        this.setCompleted();
      }
    }
    this._status = status;
  }
  get status(): AwInputStatus {
    return this._status;
  }

  @HostBinding('class.form-control-xs')
  get xs(): boolean {
    return this.size === 'xs';
  }

  @HostBinding('class.form-control-sm')
  get sm(): boolean {
    return this.size === 'sm';
  }

  @HostBinding('class.form-control-lg')
  get lg(): boolean {
    return this.size === 'lg';
  }

  @HostBinding('class.is-invalid')
  get isInvalid(): boolean {
    return this.status === 'invalid';
  }

  @HostBinding('class.is-valid')
  get isValid(): boolean {
    return this.status === 'valid';
  }

  @HostBinding('style.resize')
  get resizeStyle(): string {
    if (!this.isTextarea()) return;
    return this.resize;
  }

  isTextarea(): boolean {
    return this.elementRef.nativeElement.tagName === 'TEXTAREA';
  }

  setEnabled(enabled: boolean): void {
    const action = enabled ? 'disable' : 'enable';
    this._ngControl?.control?.[action]?.({
      emitEvent: this.emitEventOnLoading,
    });
  }

  ngOnInit(): void {
    if (this.awSpinnerDirective) {
      this.awSpinnerDirective.size = 'sm';
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this._timeoutCompletedTime);
  }
}
