import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CnVisualizarMapaRoutingModule } from './cn-visualizar-mapa-routing.module';
import { VisualizarMapaCnComponent } from './visualizar-mapa-cn.component';
import { FilterAprovadoresPipe } from './filter-aprovadores.pipe';
import { SharedModule } from '@aw-shared/shared.module';
import { SharedCompraModule } from '../../shared-compra/shared-compra.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';

@NgModule({
  declarations: [VisualizarMapaCnComponent, FilterAprovadoresPipe],
  imports: [CommonModule, CnVisualizarMapaRoutingModule, SharedModule, SharedCompraModule, AwComponentsModule],
})
export class CnVisualizarMapaModule {}
