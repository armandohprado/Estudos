import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { AwSpinnerSize } from '@aw-components/aw-spinner/aw-spinner.types';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'aw-spinner',
  templateUrl: './aw-spinner.component.html',
  styleUrls: ['./aw-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwSpinnerComponent {
  static ngAcceptInputType_fullScreen: BooleanInput;

  private _fullScreen = false;

  @Input() zIndex = 999999;
  @Input() borderRadius: string;
  @Input() @HostBinding('class.aw-spinner__overlay') overlay = true;
  @Input() @HostBinding('class.aw-spinner__overlay--no-background') noBackground = false;
  @Input() size: AwSpinnerSize = 'default';

  @HostBinding('style.z-index')
  get zIndexStyle(): number {
    return this.overlay ? this.zIndex : 0;
  }

  @Input()
  @HostBinding('class.aw-spinner__overlay--fullscreen')
  set fullScreen(fullScreen: boolean) {
    this._fullScreen = coerceBooleanProperty(fullScreen);
  }
  get fullScreen(): boolean {
    return this._fullScreen;
  }
}
