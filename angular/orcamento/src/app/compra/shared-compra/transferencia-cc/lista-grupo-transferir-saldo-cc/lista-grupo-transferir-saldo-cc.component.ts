import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FamiliaTransferenciaCC, GruposTransferenciaCC } from '@aw-models/transferencia-cc';
import { ListaItensCCComponent } from '../modal-lista-itens-cc/lista-itens-cc.component';
import { PlanilhaHibridaTransferirSaldoCC } from '../../../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { upsert } from '@aw-utils/util';
import { BsModalService } from 'ngx-bootstrap/modal';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-lista-grupo-transferir-saldo-cc',
  templateUrl: './lista-grupo-transferir-saldo-cc.component.html',
  styleUrls: ['./lista-grupo-transferir-saldo-cc.component.scss'],
})
export class ListaGrupoTransferirSaldoCcComponent implements OnInit {
  constructor(private bsModalService: BsModalService) {}

  @Output() recalcular = new EventEmitter<PlanilhaHibridaTransferirSaldoCC[]>();
  @Input() payload: PlanilhaHibridaTransferirSaldoCC[] = [];
  @Input() idPlanilhaHibrida: number;
  @Input() familia: FamiliaTransferenciaCC;
  @Input() grupos: GruposTransferenciaCC[];
  @Input() isValid: boolean;
  trackByGrupo = trackByFactory<GruposTransferenciaCC>('idCompraNegociacaoGrupo');

  ngOnInit(): void {}
  openItensGrupo(grupo: GruposTransferenciaCC): void {
    this.bsModalService.show(ListaItensCCComponent, {
      animated: true,
      initialState: {
        retornoPayload: this.payload,
        grupo,
        confirmarTransferencia: (payload: PlanilhaHibridaTransferirSaldoCC[]) => {
          this.payload = upsert(this.payload, payload, 'idConfirmacaoCompraItem');
          this.recalcular.emit(this.payload);
        },
        idPlanilhaHibrida: this.idPlanilhaHibrida,
      },
      class: 'modal-xxl',
    });
  }
}
