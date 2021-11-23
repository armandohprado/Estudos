import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CadernosRoutingModule } from './cadernos-routing.module';
import { SharedModule } from '@aw-shared/shared.module';
import { CadernosComponent } from './cadernos.component';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { ModalEvidenciasCadernoComponent } from './modal-evidencias-caderno/modal-evidencias-caderno.component';
import { ModalCadernoRelatoriosComponent } from './caderno/modal-caderno-relatorios/modal-caderno-relatorios.component';

@NgModule({
  declarations: [CadernosComponent, ModalCadernoRelatoriosComponent, ModalEvidenciasCadernoComponent],
  imports: [CommonModule, CadernosRoutingModule, SharedModule, AwComponentsModule],
})
export class CadernosModule {}
