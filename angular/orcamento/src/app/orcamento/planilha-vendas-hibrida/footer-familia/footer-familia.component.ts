import { PlanilhaVendasHibridaService } from '../planilha-vendas-hibrida.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Cenario, OrcamentoCenarioFamilia } from '../models/cenario';
import { TotalFamilia } from '../models/total-familia';
import { Subject } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from 'ngx-currency';
import { PlanilhaVendasHibridaOpcionalService } from '../planilha-vendas-hibrida-opcional.service';

@Component({
  selector: 'app-footer-familia',
  templateUrl: './footer-familia.component.html',
  styleUrls: ['./footer-familia.component.scss'],
})
export class FooterFamiliaComponent implements OnInit, OnDestroy {
  constructor(
    public planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private planilhaVendasHibridaOpcionalService: PlanilhaVendasHibridaOpcionalService
  ) {}

  private _destroy$ = new Subject<void>();

  @Input() familia: OrcamentoCenarioFamilia;
  @Input() idOrcamentoCenario: number;
  @Input() idOrcamento: number;
  @Input() cenario: Cenario;
  @Input() isChangeOrder: boolean;

  totalFamiliaFooter: TotalFamilia = {} as TotalFamilia;

  editComplementoPosition: ConnectedPosition = {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
    offsetY: 5,
    offsetX: -17,
  };

  currencyPrecision4: Partial<CurrencyMaskConfig> = { precision: 4, inputMode: CurrencyMaskInputMode.NATURAL };
  currencyPrecision2: Partial<CurrencyMaskConfig> = { precision: 2, inputMode: CurrencyMaskInputMode.NATURAL };

  obterTotalFamilia(idOrcamentoCenarioFamilia): void {
    this.planilhaVendasHibridaService
      .getTotalFamilia(idOrcamentoCenarioFamilia, this.idOrcamentoCenario)
      .subscribe(data => {
        this.totalFamiliaFooter = data;
        this.totalFamiliaFooter.loading = 'completed';
      });
  }

  calcularFamilia(objFamiliaFooter: TotalFamilia, campo?: string): void {
    objFamiliaFooter.fixoFinalProposta = !!this.cenario?.tipoTaxaAdministrativa;

    switch (campo) {
      case 'porcentotaxaadm':
        objFamiliaFooter.valorTaxaAdm = 0;
        break;
      case 'valortaxaadm':
        objFamiliaFooter.percentualTaxaAdm = 0;
        break;
    }
    this.totalFamiliaFooter.loading = 'loading';
    this.planilhaVendasHibridaService
      .calcularFamilia(objFamiliaFooter, this.idOrcamento, false)
      .pipe(
        tap(data => {
          this.totalFamiliaFooter = { ...this.totalFamiliaFooter, ...data };
          this.planilhaVendasHibridaService.editComentarioTaxaAdmFamilia = false;
        }),
        finalize(() => {
          this.planilhaVendasHibridaOpcionalService.getFamiliaGruposOpcionais(this.idOrcamentoCenario).subscribe();
          this.totalFamiliaFooter.loading = 'completed';
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.planilhaVendasHibridaService.atualizarTaxasAction$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.obterTotalFamilia(this.familia.idOrcamentoCenarioFamilia);
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  alterarBaseCalculoFamilia(idOrcamentoCenarioFamilia: number, input: HTMLInputElement): void {
    this.totalFamiliaFooter.loading = 'loading';
    this.planilhaVendasHibridaService
      .atualizarBaseCalculoFamilia(idOrcamentoCenarioFamilia)
      .pipe(
        tap((taxaEmPercentual: boolean) => {
          this.planilhaVendasHibridaService.updateFamilia(this.familia.idOrcamentoFamilia, { taxaEmPercentual });
        }),
        finalize(() => {
          this.totalFamiliaFooter.loading = 'completed';
          this.adcFocus(input);
        })
      )
      .subscribe();
  }

  adcFocus(input: HTMLInputElement): void {
    setTimeout(() => {
      input.select();
      input.focus();
    });
  }
}
