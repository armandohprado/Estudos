import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AwToggleBeforeDirective } from './aw-toggle-before.directive';
import { AwToggleAfterDirective } from './aw-toggle-after.directive';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'aw-toggle',
  templateUrl: './aw-toggle.component.html',
  styleUrls: ['./aw-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AwToggleComponent),
      multi: true,
    },
  ],
  host: { class: 'aw-toggle' },
})
export class AwToggleComponent implements ControlValueAccessor {
  static ngAcceptInputType_small: BooleanInput;

  constructor(public changeDetectorRef: ChangeDetectorRef) {}

  @ContentChildren(AwToggleBeforeDirective, { descendants: true }) beforeDirectives: QueryList<AwToggleBeforeDirective>;
  @ContentChildren(AwToggleAfterDirective, { descendants: true }) afterDirectives: QueryList<AwToggleAfterDirective>;

  @Input() @HostBinding('class.disabled') disabled: boolean;
  @Input() @HostBinding('class.checked') checked: boolean;
  @Input() @HostBinding('class.vertical') vertical: boolean;

  @Input()
  @HostBinding('class.small')
  get small(): boolean {
    return this._small;
  }
  set small(value: boolean) {
    this._small = coerceBooleanProperty(value);
  }
  private _small: boolean;

  @Output() checkedChange = new EventEmitter<boolean>();

  _onChange = (value: boolean) => {};
  _onTouched = () => {};

  @HostListener('click')
  onClick(): void {
    this.onChange(!this.checked);
  }

  onChange(value: boolean): void {
    if (this.disabled) {
      return;
    }
    this._onChange(value);
    this._onTouched();
    this.checkedChange.emit(value);
    this.checked = value;
    this.changeDetectorRef.markForCheck();
  }

  onSpace($event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }
    $event.preventDefault();
    this.onChange(!this.checked);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.checked = coerceBooleanProperty(obj);
    this.changeDetectorRef.markForCheck();
  }
}
