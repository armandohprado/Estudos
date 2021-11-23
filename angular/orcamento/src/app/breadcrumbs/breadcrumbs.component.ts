import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { trackByFactory } from '../utils/track-by';
import { Breadcrumb } from './breadcrumb';
import { BreadcrumbsService } from './breadcrumbs.service';
import { environment } from '../../environments/environment';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  static ngAcceptInputType_debugRoutePath: BooleanInput;

  constructor(public breadcrumbsService: BreadcrumbsService) {}

  private _debugRoutePath = false;

  readonly dev = environment.dev;

  @Input()
  get debugRoutePath(): boolean {
    return this._debugRoutePath;
  }
  set debugRoutePath(value: boolean) {
    this._debugRoutePath = coerceBooleanProperty(value);
  }

  readonly trackBy = trackByFactory<Breadcrumb>('text');
}
