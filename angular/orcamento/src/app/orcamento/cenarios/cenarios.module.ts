import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CenariosRoutingModule } from './cenarios-routing.module';
import { CenariosComponent } from './cenarios.component';
import { CenarioComponent } from './cenario/cenario.component';
import { SharedModule } from '../../shared/shared.module';
import { ModalCenarioComponent } from './modal-cenario.component';
import { AwComponentsModule } from '../../aw-components/aw-components.module';

@NgModule({
  declarations: [CenariosComponent, CenarioComponent, ModalCenarioComponent],
  imports: [CommonModule, CenariosRoutingModule, SharedModule, AwComponentsModule],
})
export class CenariosModule {}
