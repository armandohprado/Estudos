import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, Renderer2 } from '@angular/core';
import { EpPropostaItem, EpPropostaItemValorUnitarioPayload } from '../model/item';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { EqualizacaoPropostaService } from '../equalizacao-proposta.service';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from 'ngx-currency';
import { distinctUntilChanged, filter, pluck, switchMap, tap } from 'rxjs/operators';
import { EpPropostaItemQuery } from '../state/item/ep-proposta-item.query';
import { trackByEpPropostaItemQuantitativoItem } from '../utils';
import { StateComponent } from '@aw-shared/components/common/state-component';

@Component({
  selector: 'app-ep-proposta-item-fornecedor',
  templateUrl: './ep-proposta-item-fornecedor.component.html',
  styleUrls: ['./ep-proposta-item-fornecedor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class EpPropostaItemFornecedorComponent extends StateComponent<{ propostaItem?: EpPropostaItem }> {
  constructor(
    private equalizacaoPropostaService: EqualizacaoPropostaService,
    public epPropostaItemQuery: EpPropostaItemQuery,
    private renderer2: Renderer2,
    private elementRef: ElementRef
  ) {
    super({}, { inputs: ['propostaItem'] });
  }

  @Input() propostaItem?: EpPropostaItem;
  @Input() propostaItemParent: EpPropostaItem;
  @Input() classificacao: number;
  @Input() idOrcamentoCenario: number;
  @Input() disabledRadio: boolean;

  modelOptions: any = { updateOn: 'blur' };

  currencyOptions: Partial<CurrencyMaskConfig> = {
    allowNegative: false,
    allowZero: true,
    nullable: false,
    inputMode: CurrencyMaskInputMode.NATURAL,
  };

  disabled$ = this.selectState('propostaItem').pipe(
    filter(propostaItem => !!propostaItem),
    pluck('idPropostaItem'),
    distinctUntilChanged(),
    switchMap(idPropostaItem => this.epPropostaItemQuery.selectItemDisabled(idPropostaItem)),
    tap(disabled =>
      disabled
        ? this.renderer2.addClass(this.elementRef.nativeElement, 'disabled')
        : this.renderer2.removeClass(this.elementRef.nativeElement, 'disabled')
    )
  );

  trackByEpPropostaItemQuantitativoItem = trackByEpPropostaItemQuantitativoItem;

  @HostBinding('class.aw-referencia')
  get awReferencia(): boolean {
    return this.propostaItem?.indicadorAWReferencia;
  }

  toggleCollapseDescricao(): void {
    this.equalizacaoPropostaService.toggleCollapseItemDescricao(this.propostaItem.idOrcamentoGrupoItem);
  }

  salvarValorUnitario(
    { idPropostaItem, idOrcamentoGrupoItem }: EpPropostaItem,
    partial: Partial<EpPropostaItemValorUnitarioPayload>
  ): void {
    const payload: EpPropostaItemValorUnitarioPayload = {
      valorServico: this.propostaItem.valorUnitarioServicoPropostaItem,
      valorProduto: this.propostaItem.valorUnitarioProdutoPropostaItem,
      awReferencia: true,
      ...partial,
    };
    this.equalizacaoPropostaService
      .salvarValorUnitarioAwReferencia(idPropostaItem, idOrcamentoGrupoItem, payload)
      .subscribe();
  }

  selecionar(propostaItem: EpPropostaItem): void {
    if (propostaItem.idPropostaItemSelecionado === propostaItem.idPropostaItem) {
      this.equalizacaoPropostaService
        .desselecionarPropostaItem(propostaItem.idProposta, propostaItem.idPropostaItem, this.idOrcamentoCenario)
        .subscribe();
    } else {
      this.equalizacaoPropostaService
        .selecionarPropostaItem(
          propostaItem.idOrcamentoGrupoItem,
          propostaItem.idProposta,
          propostaItem.idPropostaItem,
          this.idOrcamentoCenario
        )
        .subscribe();
    }
  }

  transferirQuantidade(propostaItem: EpPropostaItem): void {
    this.equalizacaoPropostaService
      .transferirQuantidadeParaAwReferencia(
        propostaItem.idProposta,
        propostaItem.idPropostaItem,
        propostaItem.idOrcamentoGrupoItem
      )
      .subscribe();
  }

  transferirValorUnitario(
    { idPropostaItem, idOrcamentoGrupoItem }: EpPropostaItem,
    partial: Partial<EpPropostaItemValorUnitarioPayload>,
    loading?: 'Produto' | 'Servico'
  ): void {
    this.equalizacaoPropostaService
      .transferirValorUnitarioParaAwReferencia(idPropostaItem, idOrcamentoGrupoItem, partial, loading)
      .subscribe();
  }

  atualizarQuantitativoAwReferencia(
    idOrcamentoGrupoItem: number,
    idFasePavimentoCentro: string,
    idQuantitativo: string,
    quantidade: number
  ): void {
    this.equalizacaoPropostaService
      .atualizarQuantitativoAwReferencia(idOrcamentoGrupoItem, idFasePavimentoCentro, idQuantitativo, quantidade)
      .subscribe();
  }
}
