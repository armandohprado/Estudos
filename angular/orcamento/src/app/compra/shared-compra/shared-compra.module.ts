import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransferirSaldoGruposComponent } from './transferir-saldo-grupos/transferir-saldo-grupos.component';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { SharedModule } from '@aw-shared/shared.module';
import { TransferenciaCcChangeOrderContainerComponent } from './transferencia-cc/transferencia-change-order-container/transferencia-cc-change-order-container.component';
import { FilterFamiliaGrupoTransferenciaCcPipe } from './transferencia-cc/pipes/filter-familia-grupo-transferencia-cc.pipe';
import { ResumoTransferirSaldoCcComponent } from './transferencia-cc/resumo-transferir-saldo-cc/resumo-transferir-saldo-cc.component';
import { ListaGrupoTransferirSaldoCcComponent } from './transferencia-cc/lista-grupo-transferir-saldo-cc/lista-grupo-transferir-saldo-cc.component';
import { FilterCenarioGrupoPipe } from './transferencia-cc/pipes/filter-cenario-grupo.pipe';
import { TransferenciaEnvioMapaContainerComponent } from './transferencia-cc/transferencia-envio-mapa-container/transferencia-envio-mapa-container.component';
import { MergeGrupoTransferenciaCCPipe } from './transferencia-cc/pipes/merge-grupo-transferencia-cc.pipe';
import { FornecedoresEnvioMapaComponent } from './fornecedores-envio-mapa/fornecedores-envio-mapa.component';
import { CnFichaFormComponent } from './cn-ficha-form/cn-ficha-form.component';
import { IsEstouroBudgetPipe } from './is-estouro-budget.pipe';
import { IsEstouroBudgetGrupoPipe } from './is-estouro-budget-grupo.pipe';
import { IsDispensaConcorrenciaPipe } from './is-dispensa-concorrencia.pipe';
import { PlanoCompraQuestoesComponent } from './plano-compra-questoes/plano-compra-questoes.component';

const DECLARATIONS = [
  TransferirSaldoGruposComponent,
  TransferenciaCcChangeOrderContainerComponent,
  TransferenciaEnvioMapaContainerComponent,
  FilterCenarioGrupoPipe,
  FornecedoresEnvioMapaComponent,
  CnFichaFormComponent,
  IsEstouroBudgetPipe,
  IsEstouroBudgetGrupoPipe,
  IsDispensaConcorrenciaPipe,
  FilterFamiliaGrupoTransferenciaCcPipe,
  ResumoTransferirSaldoCcComponent,
  ListaGrupoTransferirSaldoCcComponent,
  MergeGrupoTransferenciaCCPipe,
  PlanoCompraQuestoesComponent,
];

@NgModule({
  declarations: [...DECLARATIONS],
  imports: [CommonModule, AwComponentsModule, PaginationModule, SharedModule],
  exports: [...DECLARATIONS],
})
export class SharedCompraModule {}
