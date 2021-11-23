import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from 'ngx-currency';
import { ActivatedRoute, Router } from '@angular/router';
import { AwRouterService } from '@aw-services/core/aw-router.service';
import { FormBuilder } from '@angular/forms';
import { EpPropostaItemQuery } from '../state/item/ep-proposta-item.query';
import { EqualizacaoPropostaService } from '../equalizacao-proposta.service';
import { finalize } from 'rxjs/operators';
import { AwSelectFooterOptions } from '@aw-components/aw-select/aw-select.type';
import { EqualizacaoPropostaModalService } from '../equalizacao-proposta-modal.service';
import { WINDOW_TOKEN } from '@aw-shared/tokens/window';

@Component({
  selector: 'app-ep-header',
  templateUrl: './ep-header.component.html',
  styleUrls: ['./ep-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpHeaderComponent {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private awRouterService: AwRouterService,
    private formBuilder: FormBuilder,
    public epPropostaItemQuery: EpPropostaItemQuery,
    private equalizacaoPropostaService: EqualizacaoPropostaService,
    private changeDetectorRef: ChangeDetectorRef,
    private equalizacaoPropostaModalService: EqualizacaoPropostaModalService,
    @Inject(WINDOW_TOKEN) private window: Window
  ) {}

  @Input() idOrcamentoCenario: number;
  @Input() idOrcamentoGrupo: number;

  gerandoComparativa = false;
  gerandoRelatorio = false;
  loadingModalHistorico = false;

  currencyOptions: Partial<CurrencyMaskConfig> = {
    allowNegative: false,
    align: 'center',
    allowZero: true,
    nullable: false,
    inputMode: CurrencyMaskInputMode.NATURAL,
  };

  selectFooter: AwSelectFooterOptions = {
    primaryBtn: { title: 'Todos' },
    secondaryBtn: { title: 'Limpar', defaultAction: false },
  };

  form = this.formBuilder.group({
    fornecedores: [this.epPropostaItemQuery.getIdsFornecedoresSelect()],
    indiceComparativa: [this.epPropostaItemQuery.getIndiceComparativa()],
  });

  voltar($event: MouseEvent): boolean {
    return this.awRouterService.handleNavigate($event, ['../../'], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'preserve',
    });
  }

  gerarComparativa(): void {
    this.gerandoComparativa = true;
    const { fornecedores, indiceComparativa } = this.form.value;
    this.equalizacaoPropostaService
      .gerarComparativa(this.idOrcamentoCenario, this.idOrcamentoGrupo, fornecedores, indiceComparativa)
      .pipe(
        finalize(() => {
          this.gerandoComparativa = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  gerarRelatorio(): void {
    this.gerandoRelatorio = true;
    this.equalizacaoPropostaService
      .gerarRelatorio(this.idOrcamentoGrupo)
      .pipe(
        finalize(() => {
          this.gerandoRelatorio = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(url => {
        this.window.open(url, '_blank');
      });
  }

  async openHistorico(): Promise<void> {
    this.loadingModalHistorico = true;
    await this.equalizacaoPropostaModalService.openHistorico(this.idOrcamentoGrupo);
    this.loadingModalHistorico = false;
    this.changeDetectorRef.markForCheck();
  }
}
