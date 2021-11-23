import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FamiliaTransferenciaCC, GruposTransferenciaCC, TransferenciaCC } from '../../../../models/transferencia-cc';
import { PlanilhaHibridaTransferirSaldoCC } from '../../../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { trackByFactory } from '../../../../utils/track-by';
import { collapseAnimation } from '../../../../shared/animations/collapse';

@Component({
  selector: 'app-transferencia-cc-change-order-container',
  templateUrl: './transferencia-cc-change-order-container.component.html',
  styleUrls: ['./transferencia-cc-change-order-container.component.scss'],
  animations: [collapseAnimation()],
})
export class TransferenciaCcChangeOrderContainerComponent implements OnInit {
  constructor() {}

  @Input() readonly: boolean;
  @Input() idPlanilhaHibrida: number;
  @Input() listaCCTransferencia: TransferenciaCC[];
  @Input() listaFamilia: FamiliaTransferenciaCC[];
  @Input() listaGrupo: GruposTransferenciaCC[] = [];
  @Input() payload: PlanilhaHibridaTransferirSaldoCC[] = [];

  @Output() payloadChange = new EventEmitter<PlanilhaHibridaTransferirSaldoCC[]>();

  filtroFamilia: number[] = [];
  filtroGrupo: number[] = [];
  valorTotal: number;

  trackByFamilia = trackByFactory<FamiliaTransferenciaCC>('idOrcamentoFamilia');
  trackByTransferencia = trackByFactory<TransferenciaCC>('idOrcamentoCenario');
  ngOnInit(): void {
    this.recalcularValorTotal(this.payload);
  }

  recalcularValorTotal(payload?: PlanilhaHibridaTransferirSaldoCC[]): void {
    this.payload = payload;
    this.valorTotal = this.listaGrupo.reduce((acc, item) => {
      return acc + +(item.valorUtilizado ?? 0);
    }, 0);
    if (payload?.length) {
      this.payloadChange.emit(this.payload);
    }
  }
}
