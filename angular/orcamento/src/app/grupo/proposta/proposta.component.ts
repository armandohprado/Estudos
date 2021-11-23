import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { trackByFactory } from '@aw-utils/track-by';
import { CotacaoService } from '@aw-services/cotacao/cotacao.service';
import { StatusProposta } from '@aw-models/status-proposta.enum';
import { Entity } from '@aw-utils/types/entity';
import { Params } from '@angular/router';
import { finalize, tap } from 'rxjs/operators';
import { EqualizacaoPropostaService } from '../../orcamento/equalizacao-proposta/equalizacao-proposta.service';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import { refreshMap } from '@aw-utils/rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { GrupoAlt } from '@aw-models/grupo-alt';
import { PropostaAlt } from '@aw-models/proposta-alt';

@Component({
  selector: 'app-proposta',
  templateUrl: './proposta.component.html',
  styleUrls: ['./proposta.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropostaComponent {
  constructor(
    private cotacaoService: CotacaoService,
    private elementRef: ElementRef,
    private equalizacaoPropostaService: EqualizacaoPropostaService,
    private changeDetectorRef: ChangeDetectorRef,
    private orcamentoAltService: OrcamentoAltService
  ) {}

  @Input() grupo: GrupoAlt;
  @Input() loadingPropostas: boolean;

  readonly trackByProposta = trackByFactory<PropostaAlt>('idProposta');

  readonly statusProposta = StatusProposta;
  showMoreValorTotal: Entity<boolean> = {};

  @Input() idProjeto: number;
  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  @Input() devolucaoPropostaRouterLink: any[] | string;
  @Input() showLinkLoginTemporario: boolean;
  @Input() toggleFornecedoresStatus: boolean;
  @Input() routerLinkQueryParams: Params = {};

  @Output() propostaSelecionada = new EventEmitter<PropostaAlt>();
  @Output() propostaChange = new EventEmitter<PropostaAlt>();

  @Input() equalizacaoDisabled = false;
  @Input() isControleCompras = false;

  loadingSelectEqualizacao = false;
  loadingLastCall = false;

  currentPage = 1;
  itemsPerPage = 10;

  private _updateProposta(idProposta: number, partial: Partial<PropostaAlt>): void {
    this.grupo = {
      ...this.grupo,
      propostas: this.grupo.propostas.map(proposta => {
        if (proposta.idProposta === idProposta) {
          proposta = { ...proposta, ...partial };
        }
        return proposta;
      }),
    };
  }

  setLastCall(proposta: PropostaAlt): void {
    if (this.loadingLastCall) {
      return;
    }
    this.loadingLastCall = true;
    const propostaAtiva = this.grupo.propostas.find(_proposta => _proposta.lastCall);
    const requests$: Observable<any>[] = [];
    if (propostaAtiva) {
      requests$.push(this.cotacaoService.saveLastCall(propostaAtiva.idProposta, false));
      this.propostaChange.emit({ ...propostaAtiva, lastCall: false });
      this._updateProposta(propostaAtiva.idProposta, { lastCall: false });
    }
    if (proposta.idProposta !== propostaAtiva?.idProposta) {
      requests$.push(this.cotacaoService.saveLastCall(proposta.idProposta, true));
      this.propostaChange.emit({ ...proposta, lastCall: true });
      this._updateProposta(proposta.idProposta, { lastCall: true });
    }
    forkJoin(requests$)
      .pipe(
        finalize(() => {
          this.loadingLastCall = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
    this.changeDetectorRef.markForCheck();
  }

  marcarProposta(proposta: PropostaAlt): void {
    if (this.equalizacaoDisabled) {
      return;
    }
    const { idProposta, equalizacaoSelecionada } = proposta;
    const { idOrcamentoGrupo } = this.grupo;
    this.loadingSelectEqualizacao = true;
    this.equalizacaoPropostaService
      .selecionarTodosHttp(idOrcamentoGrupo, idProposta, this.idOrcamentoCenario, !equalizacaoSelecionada)
      .pipe(
        refreshMap(() =>
          this.orcamentoAltService.getGrupo(this.idOrcamento, this.idOrcamentoCenario, this.grupo.idOrcamentoGrupo)
        ),
        tap(() => {
          this.propostaSelecionada.emit(proposta);
          this._updateProposta(proposta.idProposta, { equalizacaoSelecionada: !equalizacaoSelecionada });
        }),
        finalize(() => {
          this.loadingSelectEqualizacao = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }
}
