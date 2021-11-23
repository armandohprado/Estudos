import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { GaAnexosAvulsosComponent } from './ga-anexos-avulsos/ga-anexos-avulsos.component';
import { GaAnexosAvulsosFilterPipe } from './ga-anexos-avulsos/ga-anexos-avulsos-filter.pipe';

@NgModule({
  imports: [CommonModule, SharedModule, AwComponentsModule],
  declarations: [GaAnexosAvulsosComponent, GaAnexosAvulsosFilterPipe],
  exports: [GaAnexosAvulsosComponent],
})
export class GerenciadorAquivosSharedModule {}
