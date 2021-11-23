import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  OnInit,
  Optional,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CdkStep, CdkStepper, STEPPER_GLOBAL_OPTIONS, StepperOptions } from '@angular/cdk/stepper';
import { convertToBoolProperty } from '../util/helpers';
import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { trackByFactory } from '@aw-utils/track-by';
import { takeUntil } from 'rxjs/operators';
import { AwStepHeaderComponent } from './aw-step-header/aw-step-header.component';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { AwComponentSize } from '../util/types';

@Component({
  selector: 'aw-step',
  templateUrl: './aw-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CdkStep, useExisting: AwStepComponent }],
  exportAs: 'aw-step',
})
export class AwStepComponent extends CdkStep {
  constructor(
    @Inject(forwardRef(() => AwStepperComponent)) stepper: AwStepperComponent,
    @Optional() @Inject(STEPPER_GLOBAL_OPTIONS) stepperOptions?: StepperOptions
  ) {
    super(stepper, stepperOptions);
  }

  @Input() customClass: string;
  @Input() breakLabel: boolean;
}

@Component({
  selector: 'aw-stepper',
  templateUrl: './aw-stepper.component.html',
  styleUrls: ['./aw-stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: AwStepperComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'aw-stepper',
})
export class AwStepperComponent extends CdkStepper implements OnInit, AfterViewInit, AfterContentInit {
  static ngAcceptInputType_minWidthConnector: BooleanInput;

  constructor(
    @Optional() dir: Directionality,
    private changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef,
    @Inject(DOCUMENT) document: Document
  ) {
    super(dir, changeDetectorRef, elementRef, document);
  }

  @ViewChildren(AwStepHeaderComponent) _stepHeader: QueryList<AwStepHeaderComponent>;
  @ContentChildren(AwStepComponent, { descendants: true }) _steps: QueryList<AwStepComponent>;
  readonly steps = new QueryList<AwStepComponent>();
  @Input() headerClass: string | string[] = '';

  @Input('vertical')
  set _vertical(vertical: '' | boolean) {
    this.vertical = convertToBoolProperty(vertical);
    this.orientation = this.vertical ? 'vertical' : 'horizontal';
  }
  @Input() verticalSizeConector: AwComponentSize = 'lg';

  vertical: boolean;

  @Input() headerWidth = 'auto';
  @Input('headerCenter')
  set _headerCenter(headerCenter: '' | boolean) {
    if (this.vertical) return;
    this.headerCenter = convertToBoolProperty(headerCenter);
    if (headerCenter && this.headerWidth === 'auto') {
      this.headerWidth = '100%';
    }
  }
  @HostBinding('class.flex-grow-1') headerCenter = false;

  @Input() breakLabel = true;

  @Input()
  get minWidthConnector(): boolean {
    return this._minWidthConnector;
  }
  set minWidthConnector(minWidthConnector: boolean) {
    this._minWidthConnector = coerceBooleanProperty(minWidthConnector);
  }
  private _minWidthConnector = false;

  trackByStep = trackByFactory<AwStepComponent>();

  get selected(): AwStepComponent | undefined {
    return this.steps?.toArray()[this.selectedIndex];
  }

  onClick(index: number): void {
    this.selectedIndex = index;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    if (this.selectedIndex > 0) {
      setTimeout(() => {
        const steps = this.steps.toArray();
        for (let i = 0, len = this.selectedIndex; i <= len; i++) {
          steps[i].interacted = true;
        }
        this._stateChanged();
      });
    }
  }

  ngAfterContentInit(): void {
    super.ngAfterContentInit();
    this.steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this._stateChanged();
    });
  }
}

// TODO(genos) adicionar AwStepper com router-outlet
