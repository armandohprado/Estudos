import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DadosService } from './service/dados.service';

@NgModule({
  imports: [CommonModule],
  declarations: [DashboardComponent],
  providers: [DadosService],
  exports: [DashboardComponent],
})
export class DashboardModule {}
