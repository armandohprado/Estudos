import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvioMapaRoutingModule } from './envio-mapa-routing.module';
import { EnvioMapaComponent } from './envio-mapa.component';
import { ValoresResumoEnvioMapaComponent } from './valores-resumo-envio-mapa/valores-resumo-envio-mapa.component';
import { ValoresEnvioMapaComponent } from './valores-envio-mapa/valores-envio-mapa.component';
import { ValidaEnvioMapaPipe } from './valida-envio-mapa.pipe';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { SharedCompraModule } from '../../shared-compra/shared-compra.module';

@NgModule({
  declarations: [EnvioMapaComponent, ValoresEnvioMapaComponent, ValoresResumoEnvioMapaComponent, ValidaEnvioMapaPipe],
  imports: [CommonModule, EnvioMapaRoutingModule, SharedModule, AwComponentsModule, SharedCompraModule],
})
export class EnvioMapaModule {}
