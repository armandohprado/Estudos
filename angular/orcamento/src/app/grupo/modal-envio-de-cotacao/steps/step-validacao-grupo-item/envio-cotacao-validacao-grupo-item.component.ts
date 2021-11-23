import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ValidacaoGrupoItem } from '../../../definicao-escopo/model/grupo-item';
import { trackByFactory } from '@aw-utils/track-by';
import { GrupoAlt } from '../../../../models';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { DefinicaoEscopoModalService } from '../../../definicao-escopo/definicao-escopo-modal.service';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';

@Component({
  selector: 'app-envio-cotacao-validacao-grupo-item',
  templateUrl: './envio-cotacao-validacao-grupo-item.component.html',
  styleUrls: ['./envio-cotacao-validacao-grupo-item.component.scss'],
})
export class EnvioCotacaoValidacaoGrupoItemComponent implements OnDestroy {
  constructor(
    public envioDeCotacaoService: EnvioDeCotacaoService,
    private definicaoEscopoModalService: DefinicaoEscopoModalService,
    private cenariosService: CenariosService
  ) {}

  private readonly _destroy$ = new Subject<void>();

  @Input() idProjeto: number;
  @Input() grupoItem: ValidacaoGrupoItem[];
  @Input() grupo: GrupoAlt;
  @Input() reenvio: boolean;
  @Input() idOrcamentoCenario: number;
  @Input() isControleCompras: boolean;

  @Output() atualizarValidacao = new EventEmitter<void>();

  readonly trackByValidacaoItem = trackByFactory<ValidacaoGrupoItem>('idOrcamentoGrupoItem');

  async abrirDefinicao(idOrcamentoGrupoItem: number): Promise<void> {
    const retornoModal = await this.definicaoEscopoModalService.openModalDefinicaoEscopo(
      this.idProjeto,
      this.grupo,
      this.cenariosService.getCenarioPadraoSnapshot(),
      this.idOrcamentoCenario,
      this.reenvio,
      idOrcamentoGrupoItem,
      this.isControleCompras
    );
    retornoModal.onHidden.pipe(take(1), takeUntil(this._destroy$)).subscribe(() => {
      this.atualizarValidacao.emit();
    });
  }

  changeStep(step: number): void {
    this.envioDeCotacaoService.changeStep(step);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
