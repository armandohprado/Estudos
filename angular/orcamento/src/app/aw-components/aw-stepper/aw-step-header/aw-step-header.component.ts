import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input } from '@angular/core';
import { CdkStepHeader } from '@angular/cdk/stepper';

@Component({
  selector: 'aw-step-header',
  templateUrl: './aw-step-header.component.html',
  styleUrls: ['./aw-step-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwStepHeaderComponent extends CdkStepHeader {
  constructor(private elementRef: ElementRef) {
    super(elementRef);
  }

  @Input() @HostBinding('class.active') active: boolean;
  @Input() index: number;
  @Input() @HostBinding('class.interacted') interacted: boolean;
  @Input() @HostBinding('class.disabled') disabled: boolean;
  @Input() @HostBinding('class.linear') linear: boolean;
  @Input() @HostBinding('class.optional') optional: boolean;
  @Input() label: string;
  @Input() @HostBinding('class.break-label') breakLabel: boolean;
  @Input() @HostBinding('class.vertical') vertical: boolean;
}
