import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

export type AwSpinnerSize = 'default' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'aw-spinner',
  templateUrl: './aw-spinner.component.html',
  styleUrls: ['./aw-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwSpinnerComponent {
  private _fullScreen = false;

  @Input() zIndex = 999999;
  @Input() borderRadius?: string;
  @Input() overlay = true;
  @Input() noBackground = false;
  @Input() size: AwSpinnerSize = 'default';

  @Input()
  set fullScreen(fullScreen: boolean) {
    this._fullScreen = coerceBooleanProperty(fullScreen);
  }
  get fullScreen(): boolean {
    return this._fullScreen;
  }

  static ngAcceptInputType_fullScreen: BooleanInput;
}
