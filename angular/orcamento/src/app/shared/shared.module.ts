import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxCurrencyModule } from 'ngx-currency';
import { WrapperPageComponent } from './wrapper-page/wrapper-page.component';
import { BoxInfoComponent } from './components/box-info/box-info.component';
import { CollapseComponent } from './components/collapse/collapse.component';
import { CollapseGroupComponent } from './components/collapse/collapse-group.component';
import { DraggableListComponent } from './components/draggable-list/draggable-list.component';
import { OrcamentoHeaderComponent } from './components/orcamento/header/orcamento-header.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { RouterModule } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { AwUtilsModule } from '@aw-components/aw-utils/aw-utils.module';
import { DateFormatDirective } from './directives/date-format.directive';
import { HourFormatDirective } from './directives/hour-format.directive';
import { ScrollableTabDirective } from './directives/scrollable-tab.directive';
import { DateValidatorDirective } from './directives/validation/date-validator.directive';
import { TelephoneDirective } from './directives/telephone.directive';
import { DisabledControlDirective } from './directives/disabled-control.directive';
import { NgLetDirective } from './directives/ng-let.directive';
import { TabOrderDirective } from './directives/tab-order.directive';
import { DragndropDirective } from './directives/dragndrop.directive';
import { FormattedTelPipe } from './pipes/formatted-tel.pipe';
import { HasSelectedGroupsPipe } from './pipes/has-selected-groups.pipe';
import { IsTelPipe } from './pipes/is-tel.pipe';
import { SelectEmployeePipe } from './pipes/select-employee.pipe';
import { SelectionGroupCounterPipe } from './pipes/selection-group-counter.pipe';
import { SituacaoPipe } from './pipes/situacao.pipe';
import { SupplierRulePipe } from './pipes/supplier-rule.pipe';
import { NormalizeStringPipe } from './pipes/normalize-string.pipe';
import { SelectedFilesInfoPipe } from './pipes/selected-files-info.pipe';
import { AbsPipe } from './pipes/abs.pipe';
import { ValueFormatterPipe } from './pipes/value-formatter.pipe';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { AwPagerDirective } from './directives/pager/aw-pager.directive';
import { MatchPatternPipe } from './pipes/match-pattern/match-pattern.pipe';
import { ReplacePatternPipe } from './pipes/replace-pattern/replace-pattern.pipe';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AlertModule } from 'ngx-bootstrap/alert';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ReduceToPipe } from './pipes/reduce-to.pipe';
import { DefaultPipe } from './pipes/default/default.pipe';
import { WrapperHeaderDirective } from './wrapper-page/wrapper-header.directive';
import { IsDefinedPipe } from './pipes/is-defined.pipe';
import { ToSpkPipe } from './pipes/to-spk.pipe';
import { RoundPipe } from './pipes/round.pipe';
import { ArredondamentoPipe } from './pipes/arredondamento.pipe';
import { FillPipe } from './pipes/fill.pipe';
import { IsAfterNowPipe } from './pipes/is-after-now.pipe';
import { AnyPipe } from './pipes/any.pipe';
import { EveryPipe } from './pipes/every.pipe';
import { SomePipe } from './pipes/some.pipe';
import { WrapperHeaderComponent } from '@aw-shared/wrapper-page/wrapper-header.component';
import { FilelistToListPipe } from '@aw-shared/pipes/filelist-to-list.pipe';

const COMPONENTS = [
  BoxInfoComponent,
  CollapseComponent,
  CollapseGroupComponent,
  DraggableListComponent,
  OrcamentoHeaderComponent,
  NavbarComponent,
  WrapperPageComponent,
  WrapperHeaderComponent,
];
const DIRECTIVES = [
  DateFormatDirective,
  HourFormatDirective,
  ScrollableTabDirective,
  DateValidatorDirective,
  TelephoneDirective,
  DisabledControlDirective,
  NgLetDirective,
  TabOrderDirective,
  DragndropDirective,
  AwPagerDirective,
  WrapperHeaderDirective,
];
const PIPES = [
  FormattedTelPipe,
  RoundPipe,
  HasSelectedGroupsPipe,
  IsTelPipe,
  SelectEmployeePipe,
  SelectionGroupCounterPipe,
  SituacaoPipe,
  SupplierRulePipe,
  NormalizeStringPipe,
  SelectedFilesInfoPipe,
  AbsPipe,
  ValueFormatterPipe,
  EllipsisPipe,
  MatchPatternPipe,
  ReplacePatternPipe,
  ReduceToPipe,
  DefaultPipe,
  IsDefinedPipe,
  ArredondamentoPipe,
  ToSpkPipe,
  FillPipe,
  IsAfterNowPipe,
  AnyPipe,
  EveryPipe,
  SomePipe,
  FilelistToListPipe,
];

const MODULES = [
  CommonModule,
  CdkTableModule,
  ScrollingModule,
  NgxCurrencyModule,
  FormsModule,
  TabsModule,
  ReactiveFormsModule,
  DragDropModule,
  TabsModule,
  CKEditorModule,
  BsDatepickerModule,
  OverlayModule,
  CdkStepperModule,
  AwUtilsModule,
  RouterModule,
];

const EXPORTS = [
  CommonModule,
  AccordionModule,
  BsDropdownModule,
  CollapseModule,
  ModalModule,
  TooltipModule,
  AlertModule,
  PaginationModule,
  PopoverModule,
];

@NgModule({
  imports: [...MODULES, ...EXPORTS],
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  exports: [...MODULES, ...COMPONENTS, ...PIPES, ...DIRECTIVES, ...EXPORTS],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
    };
  }
}
