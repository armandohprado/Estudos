import { NgModule } from '@angular/core';
import { AwSearchPipe } from './aw-search/aw-search.pipe';
import { AwImgOnErrorDirective } from './aw-img-on-error.directive';
import { AwPercentOfPipe } from './aw-percent-of/aw-percent-of.pipe';
import { AwOrderByPipe } from './aw-order-by/aw-order-by.pipe';
import { AwFilterPipe } from '../aw-filter/aw-filter.pipe';
import { AwSumByPipe } from './aw-sum-by/sum-by.pipe';

const DECLARATIONS = [AwSearchPipe, AwImgOnErrorDirective, AwPercentOfPipe, AwOrderByPipe, AwFilterPipe, AwSumByPipe];

@NgModule({
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
})
export class AwUtilsModule {}
