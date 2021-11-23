import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

let ID = 0;

@Component({
  selector: 'aw-file',
  exportAs: 'aw-file',
  templateUrl: './aw-file.component.html',
  styleUrls: ['./aw-file.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AwFileComponent), multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwFileComponent implements OnDestroy, ControlValueAccessor, OnChanges {
  static ngAcceptInputType_multiple: BooleanInput;
  static ngAcceptInputType_grayBackground: BooleanInput;
  static ngAcceptInputType_clearable: BooleanInput;

  constructor(private changeDetectorRef: ChangeDetectorRef, private renderer2: Renderer2) {}

  private readonly _destroy$ = new Subject<void>();

  private _multiple = false;
  private _clearable = false;
  private _grayBackground = false;

  @ViewChild('inputRef') readonly inputElementRef: ElementRef<HTMLInputElement>;

  id = 'aw-file-' + ID++;

  @Input() @HostBinding('class.disabled') disabled: boolean;

  @Input()
  set multiple(multiple: boolean) {
    this._multiple = coerceBooleanProperty(multiple);
  }
  get multiple(): boolean {
    return this._multiple;
  }

  @Input()
  set clearable(clearable: boolean) {
    this._clearable = coerceBooleanProperty(clearable);
  }
  get clearable(): boolean {
    return this._clearable;
  }

  @Input() btnLabel = 'Anexar arquivos';
  @Input() otherLabel = 'ou arraste e jogue seus arquivos aqui';
  @Input() loading = false;
  @Input() files: FileList | null | undefined;
  @Input() hasError = false;
  @Input() errorMessage = 'Erro ao fazer upload do arquivo';
  @Input() pluralMapping: { [count: string]: string };
  @Input() maxSize = 10000000;
  @Input() maxSizeErrorMessage = 'Tamanho do arquivo maior que o máximo permitido';

  maxSizeError = false;

  @Input()
  @HostBinding('class.gray-background')
  get grayBackground(): boolean {
    return this._grayBackground;
  }
  set grayBackground(gray: boolean) {
    this._grayBackground = coerceBooleanProperty(gray);
  }

  @HostBinding('class.has-error')
  get hasErrorBinding(): boolean {
    return this.hasError && !this.loading;
  }

  @Output() readonly filesChange = new EventEmitter<FileList>();

  @HostBinding('class.dragover') dragginOver = false;

  _onChange: (value: FileList | null | undefined) => void = () => {};
  _onTouched: () => void = () => {};

  @HostListener('drop', ['$event'])
  onDrop($event: DragEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.dragginOver = false;
    if (this.disabled || this.loading) {
      return;
    }
    this.emitFiles($event.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  onDragover($event: DragEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.dragginOver = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragleave($event: DragEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.dragginOver = false;
  }

  onChange($event: Event): void {
    $event.preventDefault();
    $event.stopPropagation();
    const files = ($event.target as HTMLInputElement).files;
    this.emitFiles(files);
  }

  private clearInput(): void {
    if (this.inputElementRef?.nativeElement) {
      this.renderer2.setProperty(this.inputElementRef.nativeElement, 'value', '');
    }
  }

  clear(): void {
    this.files = null;
    this.filesChange.emit(null);
    this._onChange(null);
    this._onTouched();
    this.clearInput();
    this.hasError = false;
    this.maxSizeError = false;
    this.changeDetectorRef.markForCheck();
  }

  private emitFiles(files: FileList): void {
    if (files?.length && this.validateMaxSize(files)) {
      this.files = files;
      this.filesChange.emit(files);
      this._onChange(files);
      this._onTouched();
    } else {
      this.clearInput();
    }
    this.changeDetectorRef.markForCheck();
  }

  private validateMaxSize(files: FileList): boolean {
    for (let i = 0, len = files.length; i < len; i++) {
      const file = files.item(i);
      if (file.size > this.maxSize) {
        this.hasError = true;
        this.maxSizeError = true;
        this.changeDetectorRef.markForCheck();
        return false;
      }
    }
    this.hasError = false;
    this.maxSizeError = false;
    this.changeDetectorRef.markForCheck();
    return true;
  }

  writeValue(files: FileList | null | undefined): void {
    this.files = files;
    if (!files?.length) {
      this.clearInput();
    }
    this.changeDetectorRef.markForCheck();
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const filesChange = changes.files;
    if (filesChange && !filesChange.isFirstChange() && !filesChange.currentValue?.length) {
      this.clearInput();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
