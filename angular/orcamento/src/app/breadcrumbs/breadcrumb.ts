import { QueryParamsHandling } from '@angular/router';

export interface Breadcrumb {
  text: string;
  path: string;
  queryParamsHandling?: QueryParamsHandling;
}
