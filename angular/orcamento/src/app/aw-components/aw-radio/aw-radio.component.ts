import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { convertToBoolProperty } from '../util/helpers';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'aw-radio',
  templateUrl: './aw-radio.component.html',
  styleUrls: ['./aw-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AwRadioComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwRadioComponent implements OnInit, ControlValueAccessor {
  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  @Input() name: string;
  @Input('checked') set _checked(checked: '' | boolean) {
    this.checked = convertToBoolProperty(checked);
  }
  checked: boolean;

  @Input() value: any;

  @Input() canUncheck = false;

  @Output() valueChange = new EventEmitter<any>();

  _disabled: boolean;

  onModelChange: any = () => {};
  onTouched: any = () => {};

  @Input()
  set disabled(disabled: boolean) {
    this._disabled = convertToBoolProperty(disabled);
  }

  onChange($event: Event, checked = true): void {
    if (this._disabled) return;
    $event.stopPropagation();
    this.checked = checked;
    this.onTouched();
    this.valueChange.emit(this.value);
    this.onModelChange(this.value);
    this.changeDetectorRef.markForCheck();
  }

  onClick($event: MouseEvent): void {
    if (this._disabled) return;
    if (this.canUncheck && this.checked) {
      this.onChange($event, false);
    } else {
      $event.stopPropagation();
    }
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.checked = '' + obj === '' + this.value;
    this.changeDetectorRef.markForCheck();
  }

  ngOnInit(): void {}
}
