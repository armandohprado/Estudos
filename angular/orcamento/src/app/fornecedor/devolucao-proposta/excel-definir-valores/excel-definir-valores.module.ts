import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelDefinirValoresComponent } from './excel-definir-valores.component';
import { SpreadSheetsModule } from '@grapecity/spread-sheets-angular';
import { ExcelDefinirValoresRoutingModule } from './excel-definir-valores-routing.module';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';

@NgModule({
  declarations: [ExcelDefinirValoresComponent],
  imports: [CommonModule, SpreadSheetsModule, ExcelDefinirValoresRoutingModule, SharedModule, AwComponentsModule],
})
export class ExcelDefinirValoresModule {}
