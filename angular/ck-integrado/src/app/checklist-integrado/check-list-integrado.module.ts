import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckListIntegradoRoutingModule } from './check-list-integrado-routing.module';
import { CheckListIntegradoComponent } from './check-list-integrado.component';
import { SpreadSheetsModule } from '@grapecity/spread-sheets-angular';
import { CliCronogramasDirective } from './cli-cronograma/cli-cronogramas.directive';
import { CliCheckListsDirective } from './cli-check-list/cli-check-lists.directive';
import { CliParticipanteDirective } from './cli-participante/cli-participante.directive';
import { AwSpinnerModule } from '../shared/aw-spinner/aw-spinner.module';
import { CliObraFaseDirective } from './cli-obra-fase/cli-obra-fase.directive';
import { CliCurvaFinanceiraDirective } from './cli-curva-financeira/cli-curva-financeira.directive';

@NgModule({
  declarations: [
    CheckListIntegradoComponent,
    CliCronogramasDirective,
    CliCheckListsDirective,
    CliParticipanteDirective,
    CliObraFaseDirective,
    CliCurvaFinanceiraDirective,
  ],
  imports: [CommonModule, CheckListIntegradoRoutingModule, SpreadSheetsModule, AwSpinnerModule],
})
export class CheckListIntegradoModule {}
