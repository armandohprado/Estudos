import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CotacaoService } from '@aw-services/cotacao/cotacao.service';
import { GrupoAlt, PropostaHistorico } from '../../models';
import { ReportsService } from '@aw-services/reports/reports.service';
import { finalize } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-modal-historico-proposta',
  templateUrl: './modal-historico-proposta.component.html',
  styleUrls: ['./modal-historico-proposta.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalHistoricoPropostaComponent implements OnInit {
  constructor(
    public bsModalRef: BsModalRef,
    private cotacaoService: CotacaoService,
    private reportsService: ReportsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() idOrcamento: number;
  @Input() idProposta: number;
  @Input() nomeFantasia: string;
  @Input() grupo: GrupoAlt;

  loading = true;
  propostas: PropostaHistorico[] = [];

  readonly trackBy = trackByFactory<PropostaHistorico>('idPropostaHistorico');

  ngOnInit(): void {
    this.cotacaoService
      .getPropostaHistoricos(this.idOrcamento, this.grupo.idGrupo, this.idProposta)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(propostas => {
        this.propostas = propostas;
      });
  }

  openReport(IdPropostaHistorico: number): void {
    this.reportsService.PlanilhaPropostaHistorico({ IdPropostaHistorico }).open();
  }
}
