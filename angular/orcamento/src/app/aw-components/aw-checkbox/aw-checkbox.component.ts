import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'aw-checkbox',
  templateUrl: './aw-checkbox.component.html',
  styleUrls: ['./aw-checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: AwCheckboxComponent, multi: true }],
})
export class AwCheckboxComponent implements ControlValueAccessor {
  static ngAcceptInputType_small: BooleanInput;
  static ngAcceptInputType_indeterminate: BooleanInput;
  static ngAcceptInputType_checked: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  private _indeterminate = false;
  private _small = false;
  private _checked = false;
  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._disabled = coerceBooleanProperty(disabled);
  }

  @Input()
  get checked(): boolean {
    return this._checked;
  }
  set checked(checked: boolean) {
    this._checked = coerceBooleanProperty(checked);
  }

  @Input()
  get indeterminate(): boolean {
    return this._indeterminate;
  }
  set indeterminate(indeterminate: boolean) {
    this._indeterminate = coerceBooleanProperty(indeterminate);
    if (this._indeterminate) {
      this._checked = false;
    }
  }

  @Input()
  get small(): boolean {
    return this._small;
  }
  set small(small: boolean) {
    this._small = coerceBooleanProperty(small);
  }

  @Output() readonly checkedChange = new EventEmitter<boolean>();

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  registerOnChange(onChange: (value: boolean) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this._checked = !!obj;
    if (this._checked) {
      this._indeterminate = false;
    }
    this.changeDetectorRef.markForCheck();
  }

  updateValue($event: Event): void {
    if (this._disabled) {
      return;
    }
    const input = $event.target as HTMLInputElement;
    this._checked = input.checked;
    if (this._checked) {
      this.indeterminate = false;
    }
    this.onChange(this._checked);
    this.checkedChange.emit(this._checked);
    this.changeDetectorRef.markForCheck();
  }
}
