import { Inject, Injectable } from '@angular/core';
import { NavigationBehaviorOptions, NavigationExtras, Router, UrlTree } from '@angular/router';
import { WINDOW_TOKEN } from '../../shared/tokens/window';

@Injectable({ providedIn: 'root' })
export class AwRouterService {
  constructor(@Inject(WINDOW_TOKEN) private window: Window, private router: Router) {}

  private _handle($event: MouseEvent, urlTree: UrlTree, extras?: NavigationBehaviorOptions): boolean {
    if ($event.button || $event.ctrlKey) {
      this.window.open(this.router.serializeUrl(urlTree), '_blank');
      return true;
    }
    this.router.navigateByUrl(urlTree, extras).then();
    return false;
  }

  handleNavigate($event: MouseEvent, commands: any[], extras?: NavigationExtras): boolean {
    const urlTree = this.router.createUrlTree(commands, extras);
    return this._handle($event, urlTree, extras);
  }

  handleNavigateByUrl($event: MouseEvent, path: string | UrlTree, extras?: NavigationExtras): boolean {
    const urlTree = path instanceof UrlTree ? path : this.router.createUrlTree([path], extras);
    return this._handle($event, urlTree, extras);
  }
}
