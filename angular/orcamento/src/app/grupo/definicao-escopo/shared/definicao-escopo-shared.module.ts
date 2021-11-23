import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxCurrencyModule } from 'ngx-currency';
import { DeTentarNovamenteComponent } from './de-tentar-novamente/de-tentar-novamente.component';
import { DeTagValidatorDirective } from './de-tag-validator.directive';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { SharedModule } from '@aw-shared/shared.module';
import { BloqueiaServicoPipe } from './bloqueia-servico.pipe';
import { BloqueiaProdutoPipe } from './bloqueia-produto.pipe';
import { DeDistribuirQuantitativoComponent } from './de-distribuir-quantitativo/de-distribuir-quantitativo.component';
import { DeDqColumnsComponent } from './de-distribuir-quantitativo/de-dq-columns/de-dq-columns.component';
import { DeDqColumnComponent } from './de-distribuir-quantitativo/de-dq-column/de-dq-column.component';
import { DeTotalCentroCustoPipe } from './de-distribuir-quantitativo/de-total-centro-custo.pipe';
import { DeGrupoItemFiltroPipe } from './de-grupo-item-filtro.pipe';
import { DePlanilhaClienteComponent } from './de-planilha-cliente/de-planilha-cliente.component';
import { DePlanilhaClienteItemsRelacionadosModalComponent } from './de-planilha-cliente/de-planilha-cliente-items-relacionados-modal/de-planilha-cliente-items-relacionados-modal.component';

const DECLARATIONS = [
  DeDistribuirQuantitativoComponent,
  DeTentarNovamenteComponent,
  DeTagValidatorDirective,
  DeDqColumnsComponent,
  DeDqColumnComponent,
  DeTotalCentroCustoPipe,
  BloqueiaServicoPipe,
  BloqueiaProdutoPipe,
  DeGrupoItemFiltroPipe,
  DePlanilhaClienteComponent,
  DePlanilhaClienteItemsRelacionadosModalComponent,
];

@NgModule({
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
  imports: [
    CommonModule,
    TooltipModule,
    FormsModule,
    TabsModule,
    NgxCurrencyModule,
    AlertModule,
    AwComponentsModule,
    SharedModule,
  ],
})
export class DefinicaoEscopoSharedModule {}
