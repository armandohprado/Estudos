import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwButtonComponent } from './aw-button/aw-button.component';
import { AwInputDirective } from './aw-input/aw-input.directive';
import { SharedModule } from '../shared/shared.module';
import { AwCheckboxComponent } from './aw-checkbox/aw-checkbox.component';
import { AwRadioComponent } from './aw-radio/aw-radio.component';
import { AwDialogComponent } from './aw-dialog/aw-dialog.component';
import { AwSpinnerDirective } from './aw-spinner/aw-spinner.directive';
import { AwTentarNovamenteComponent } from './aw-tentar-novamente/aw-tentar-novamente.component';
import { AwStepComponent, AwStepperComponent } from './aw-stepper/aw-stepper.component';
import { AwSelectComponent } from './aw-select/aw-select.component';
import { AwUtilsModule } from './aw-utils/aw-utils.module';
import { AwFilterComponent } from './aw-filter/aw-filter.component';
import { AwFilterDirective } from './aw-filter/aw-filter.directive';
import { AwSelectFornecedoresComponent } from './select-fornecedores/select-fornecedores.component';
import { AwPageFornecedoresComponent } from './select-fornecedores/page-fornecedores/page-fornecedores.component';
import { AwFileComponent } from './aw-file/aw-file.component';
import { AwAlertComponent } from './aw-alert/aw-alert.component';
import { AwToggleComponent } from './aw-toggle/aw-toggle.component';
import { AwToggleBeforeDirective } from './aw-toggle/aw-toggle-before.directive';
import { AwToggleAfterDirective } from './aw-toggle/aw-toggle-after.directive';
import { AwStepHeaderComponent } from './aw-stepper/aw-step-header/aw-step-header.component';
import { AwCollapseComponent } from './aw-collapse/aw-collapse.component';
import { CollapseHeaderDirective } from './aw-collapse/collapse-header.directive';
import { AwSpinnerComponent } from './aw-spinner/aw-spinner.component';

const DECLARATIONS = [
  AwButtonComponent,
  AwInputDirective,
  AwCheckboxComponent,
  AwRadioComponent,
  AwSpinnerDirective,
  AwTentarNovamenteComponent,
  AwStepperComponent,
  AwStepComponent,
  AwStepHeaderComponent,
  AwSelectComponent,
  AwFilterDirective,
  AwSelectFornecedoresComponent,
  AwPageFornecedoresComponent,
  AwDialogComponent,
  AwFilterComponent,
  AwFileComponent,
  AwAlertComponent,
  AwToggleComponent,
  AwToggleBeforeDirective,
  AwToggleAfterDirective,
  AwCollapseComponent,
  CollapseHeaderDirective,
  AwSpinnerComponent,
];

@NgModule({
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS, AwUtilsModule],
  imports: [CommonModule, SharedModule, AwUtilsModule],
})
export class AwComponentsModule {}
