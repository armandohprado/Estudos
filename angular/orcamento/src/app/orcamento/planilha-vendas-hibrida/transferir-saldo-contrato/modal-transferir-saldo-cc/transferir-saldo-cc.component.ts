import { Component, Input, OnInit } from '@angular/core';
import { PlanilhaHibridaGrupo } from '../../models/grupo';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CcGrupoService } from '../../../../compra/controle-compras/state/grupos/cc-grupo.service';
import { PlanilhaVendasHibridaService } from '../../planilha-vendas-hibrida.service';
import { trackByFactory } from '@aw-utils/track-by';
import { PropostaAlt } from '../../../../models';
import { PlanilhaHibridaTransferirSaldoCC } from '../../models/transferir-saldo';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Component({
  selector: 'app-transferir-saldo-cc',
  templateUrl: './transferir-saldo-cc.component.html',
  styleUrls: ['./transferir-saldo-cc.component.scss'],
})
export class TransferirSaldoCcComponent implements OnInit {
  constructor(
    public bsModalRef: BsModalRef,
    private bsModalService: BsModalService,
    public ccGruposService: CcGrupoService,
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private orcamentoAltService: OrcamentoAltService
  ) {}

  @Input() planilhaHibridaGrupo: PlanilhaHibridaGrupo;
  @Input() idOrcamento: number;

  propostas$: Observable<PropostaAlt[]>;

  payload: PlanilhaHibridaTransferirSaldoCC[] = [];

  trackByProposta = trackByFactory<PropostaAlt>('idProposta');

  loading = false;
  readonly = false;

  ngOnInit(): void {
    this.ccGruposService.getSetTransferenciaCC(
      this.idOrcamento,
      this.planilhaHibridaGrupo.planilhaHibrida.idPlanilhaHibrida
    );
    this.propostas$ = this.orcamentoAltService
      .getGrupo(
        this.idOrcamento,
        this.planilhaHibridaGrupo.idOrcamentoCenario,
        this.planilhaHibridaGrupo.idOrcamentoGrupo
      )
      .pipe(map(grupo => grupo.propostas));
  }

  transferir(): void {
    if (!this.readonly) {
      this.readonly = !this.readonly;
      return;
    }
    this.planilhaVendasHibridaService
      .transferenciaCC(this.planilhaHibridaGrupo, this.payload, this.idOrcamento)
      .subscribe();
    this.bsModalRef.hide();
  }

  setPayload(payload: PlanilhaHibridaTransferirSaldoCC[]): void {
    this.payload = payload;
  }

  close(): void {
    this.bsModalRef.hide();
  }
}
