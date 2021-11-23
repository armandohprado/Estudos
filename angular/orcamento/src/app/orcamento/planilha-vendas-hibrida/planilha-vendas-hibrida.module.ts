import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanilhaVendasHibridaRoutingModule } from './planilha-vendas-hibrida-routing.module';
import { PlanilhaVendasHibridaComponent } from './planilha-vendas-hibrida.component';
import { HeaderPlanilhaVendasHibridaComponent } from './header-planilha-vendas-hibrida/header-planilha-vendas-hibrida.component';
import { PlanilhaHibridaGruposComponent } from './planilha-hibrida-grupos/planilha-hibrida-grupos.component';
import { FichaCeoComponent } from './ficha-ceo/ficha-ceo.component';
import { QuadroResumoComponent } from './quadro-resumo/quadro-resumo.component';
import { FooterFamiliaComponent } from './footer-familia/footer-familia.component';
import { TaxasComponent } from './taxas/taxas.component';
import { ValorFixoPropostaComponent } from './taxas/valor-fixo-proposta/valor-fixo-proposta.component';
import { BensServicosComponent } from './taxas/bens-servicos/bens-servicos.component';
import { GrupoPropostaModule } from '../../grupo/grupo-proposta.module';
import { TransferirSaldoChangeOrderComponent } from './change-order/transferir-saldo-change-order/transferir-saldo-change-order.component';
import { SharedCompraModule } from '../../compra/shared-compra/shared-compra.module';
import { PhCoTransacoesComponent } from './change-order/ph-co-transacoes/ph-co-transacoes.component';
import { HasAnyTransferenciaPipe } from './change-order/transferir-saldo-change-order/has-any-transferencia.pipe';
import { SumTransacoesPipe } from './change-order/transferir-saldo-change-order/sum-transacoes.pipe';
import { TransferirSaldoCcComponent } from './transferir-saldo-contrato/modal-transferir-saldo-cc/transferir-saldo-cc.component';
import { ListaItensCCComponent } from '../../compra/shared-compra/transferencia-cc/modal-lista-itens-cc/lista-itens-cc.component';
import { GrupaoHasAnyGruposPipe } from './grupao-has-any-grupos.pipe';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { PhPropostaComponent } from './planilha-hibrida-grupos/ph-proposta/ph-proposta.component';
import { PhValidacaoComentariosComponent } from './ph-validacao-comentarios/ph-validacao-comentarios.component';
import { PhOpcionalComponent } from './ph-grupo-opcional/ph-opcional.component';
import { PhOpcionalGrupaoHeaderComponent } from './ph-grupo-opcional/ph-opcional-familia/ph-opcional-grupao-header/ph-opcional-grupao-header.component';
import { PhOpcionalFamiliaComponent } from './ph-grupo-opcional/ph-opcional-familia/ph-opcional-familia.component';
import { PhOpcionalGrupaoBodyComponent } from './ph-grupo-opcional/ph-opcional-familia/ph-opcional-grupao-body/ph-opcional-grupao-body.component';
import { PhOpcionalGrupaoFooterComponent } from './ph-grupo-opcional/ph-opcional-familia/ph-opcional-grupao-footer/ph-opcional-grupao-footer.component';
import { PhModalConfirmacaoCongelamentoComponent } from './ph-modal-confirmacao-congelamento/ph-modal-confirmacao-congelamento.component';
import { ModalProjetoTecnicoClassificacaoComponent } from './modal-projeto-tecnico-classificacao/modal-projeto-tecnico-classificacao.component';
import { ModalItensReutilizadosComponent } from './modal-itens-reutilizados/modal-itens-reutilizados.component';
import { PlanilhaVendasHibridaSharedModule } from './shared/planilha-vendas-hibrida-shared.module';

@NgModule({
  declarations: [
    PlanilhaVendasHibridaComponent,
    HeaderPlanilhaVendasHibridaComponent,
    PlanilhaHibridaGruposComponent,
    FichaCeoComponent,
    QuadroResumoComponent,
    FooterFamiliaComponent,
    TaxasComponent,
    ValorFixoPropostaComponent,
    BensServicosComponent,
    TransferirSaldoChangeOrderComponent,
    PhCoTransacoesComponent,
    HasAnyTransferenciaPipe,
    SumTransacoesPipe,
    TransferirSaldoCcComponent,
    ListaItensCCComponent,
    GrupaoHasAnyGruposPipe,
    PhPropostaComponent,
    PhValidacaoComentariosComponent,
    PhOpcionalComponent,
    PhOpcionalGrupaoHeaderComponent,
    PhOpcionalFamiliaComponent,
    PhOpcionalGrupaoBodyComponent,
    PhOpcionalGrupaoFooterComponent,
    PhModalConfirmacaoCongelamentoComponent,
    ModalProjetoTecnicoClassificacaoComponent,
    ModalItensReutilizadosComponent,
  ],
  imports: [
    CommonModule,
    PlanilhaVendasHibridaRoutingModule,
    SharedModule,
    AwComponentsModule,
    GrupoPropostaModule,
    SharedCompraModule,
    PlanilhaVendasHibridaSharedModule,
  ],
  exports: [],
})
export class PlanilhaVendasHibridaModule {}
