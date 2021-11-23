import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FamiliaTransferenciaCC, GruposTransferenciaCC, TransferenciaCC } from '@aw-models/transferencia-cc';
import { PlanilhaHibridaTransferirSaldoCC } from '../../../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-transferencia-envio-mapa-container',
  templateUrl: './transferencia-envio-mapa-container.component.html',
  styleUrls: ['./transferencia-envio-mapa-container.component.scss'],
})
export class TransferenciaEnvioMapaContainerComponent implements OnInit {
  constructor() {}
  @Input() readonly: boolean;
  @Input() idPlanilhaHibrida: number;
  @Input() listaTransferenciaCC: TransferenciaCC[] = [];
  @Input() listaGrupo: GruposTransferenciaCC[] = [];
  @Input() payload: PlanilhaHibridaTransferirSaldoCC[] = [];
  @Input() itemsPerPage = 10;
  @Output() payloadChange = new EventEmitter<PlanilhaHibridaTransferirSaldoCC[]>();

  filtroFamilia: number[] = [];
  currentPage = 1;

  filtroGrupo: number[] = [];
  valorTotal: number;

  trackByFamilia = trackByFactory<FamiliaTransferenciaCC>('idOrcamentoFamilia');

  ngOnInit(): void {
    this.recalcularValorTotal(this.payload);
  }

  recalcularValorTotal(payload?: PlanilhaHibridaTransferirSaldoCC[]): void {
    this.payload = payload;
    this.valorTotal = this.payload.reduce((acc, item) => {
      return acc + +(item.valorTransferido ?? 0);
    }, 0);
    if (payload?.length) {
      this.payloadChange.emit(payload);
    }
  }
}
