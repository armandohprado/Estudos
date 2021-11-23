import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LousaGruposComponent } from './lousa-grupos/lousa-grupos.component';
import { LousaGruposHeaderComponent } from './lousa-grupos-header/lousa-grupos-header.component';
import { LousaHeaderComponent } from './lousa-header/lousa-header.component';
import { LousaComponent } from './lousa.component';
import { LousaRoutingModule } from './lousa-routing.module';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';

@NgModule({
  declarations: [LousaComponent, LousaHeaderComponent, LousaGruposComponent, LousaGruposHeaderComponent],
  imports: [CommonModule, LousaRoutingModule, SharedModule, AwComponentsModule],
})
export class LousaModule {}
