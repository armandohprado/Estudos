import { StateContext } from '@ngxs/store';

export interface NgxsAction<S = any, C = any, R = any> {
  action(state: StateContext<S>, context: C): R;
}
