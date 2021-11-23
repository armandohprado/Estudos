import { RouterQuery as OriginRouterQuery, RouterStore } from '@datorama/akita-ng-router-store';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AwRouterQuery extends OriginRouterQuery {
  constructor(routerStore: RouterStore, private activatedRoute: ActivatedRoute) {
    super(routerStore);
  }

  getFirstParam(param: string): string {
    let state = this.activatedRoute.root;
    while (state.firstChild) {
      if (state.snapshot.paramMap.has(param) || !state.firstChild) {
        break;
      } else {
        state = state.firstChild;
      }
    }
    return state.snapshot.paramMap.get(param);
  }

  getAllParams(param: string): string[] {
    let state = this.activatedRoute.root;
    const params = new Set<string>();
    while (state.firstChild) {
      if (state.snapshot.paramMap.has(param)) {
        params.add(state.snapshot.paramMap.get(param));
      }
      state = state.firstChild;
    }
    params.add(state.snapshot.paramMap.get(param));
    return [...params];
  }
}
