import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsRoutingModule } from './clients-routing.module';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ClientListComponent, ClientFormComponent],
  imports: [CommonModule, ClientsRoutingModule, ReactiveFormsModule],
})
export class ClientsModule {}
