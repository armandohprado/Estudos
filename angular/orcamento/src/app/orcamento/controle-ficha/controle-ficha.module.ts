import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControleFichaRoutingModule } from './controle-ficha-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { AwComponentsModule } from '../../aw-components/aw-components.module';
import { BodyControleFichasComponent } from './body-controle-fichas/body-controle-fichas.component';
import { HeaderControleFichasComponent } from './header-controle-fichas/header-controle-fichas.component';
import { ControleFichaComponent } from './controle-ficha.component';

@NgModule({
  declarations: [
    ControleFichaComponent,
    HeaderControleFichasComponent,
    BodyControleFichasComponent,
    BodyControleFichasComponent,
    HeaderControleFichasComponent,
  ],
  imports: [CommonModule, ControleFichaRoutingModule, SharedModule, AwComponentsModule],
})
export class ControleFichaModule {}
