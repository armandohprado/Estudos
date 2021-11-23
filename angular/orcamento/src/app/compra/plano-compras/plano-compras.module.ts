import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanoComprasRoutingModule } from './plano-compras-routing.module';
import { PlanoComprasComponent } from './plano-compras.component';
import { PcCabecalhoComponent } from './pc-cabecalho/pc-cabecalho.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { AgGridModule } from '@ag-grid-community/angular';
import { PcColunasGruposComponent } from './pc-colunas-grupos/pc-colunas-grupos.component';
import { PcGridComponent } from './pc-grid/pc-grid.component';
import { PcGridHeaderComponent } from './pc-grid/pc-grid-custom/pc-grid-header/pc-grid-header.component';
import { PcGridFilterComponent } from './pc-grid/pc-grid-custom/pc-grid-filter/pc-grid-filter.component';
import { PcGridCellComponent } from './pc-grid/pc-grid-custom/pc-grid-cell/pc-grid-cell.component';
import { PcColunasComponent } from './pc-colunas/pc-colunas.component';
import { PcGridResponsaveisComponent } from './pc-grid/pc-grid-responsaveis/pc-grid-responsaveis.component';
import { PcGridCellEditorComponent } from './pc-grid/pc-grid-custom/pc-grid-cell-editor/pc-grid-cell-editor.component';
import { PcGridSelectGroupComponent } from './pc-grid/pc-grid-select-group/pc-grid-select-group.component';
import { PcGridDatasComponent } from './pc-grid/pc-grid-datas/pc-grid-datas.component';
import { PcAddGruposComponent } from './pc-add-grupos/pc-add-grupos.component';
import { PlanoOrcamentoModule } from '../../orcamento/plano-de-orcamento/plano-orcamento.module';

@NgModule({
  declarations: [
    PlanoComprasComponent,
    PcCabecalhoComponent,
    PcColunasGruposComponent,
    PcGridComponent,
    PcGridHeaderComponent,
    PcGridFilterComponent,
    PcGridCellComponent,
    PcGridResponsaveisComponent,
    PcColunasComponent,
    PcGridCellEditorComponent,
    PcGridSelectGroupComponent,
    PcGridDatasComponent,
    PcAddGruposComponent,
  ],
  imports: [
    CommonModule,
    PlanoComprasRoutingModule,
    SharedModule,
    AwComponentsModule,
    AgGridModule.withComponents([
      PcGridHeaderComponent,
      PcGridFilterComponent,
      PcGridCellComponent,
      PcGridResponsaveisComponent,
      PcGridCellEditorComponent,
    ]),
    PlanoOrcamentoModule,
  ],
})
export class PlanoComprasModule {}
