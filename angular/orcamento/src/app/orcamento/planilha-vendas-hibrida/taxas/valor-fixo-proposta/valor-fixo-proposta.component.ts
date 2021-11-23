import { Component, Input, OnInit } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Cenario } from '../../models/cenario';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { finalize, tap } from 'rxjs/operators';
import { PlanilhaVendasHibridaService } from '../../planilha-vendas-hibrida.service';
import { CurrencyMaskConfig } from 'ngx-currency';
import { PlanilhaVendasHibridaOpcionalService } from '../../planilha-vendas-hibrida-opcional.service';

@Component({
  selector: 'app-valor-fixo-proposta',
  templateUrl: './valor-fixo-proposta.component.html',
  styleUrls: ['../bens-servicos/bens-servicos.component.scss', './valor-fixo-proposta.component.scss'],
})
export class ValorFixoPropostaComponent implements OnInit {
  constructor(
    public planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    public planilhaVendasHibridaOpcionalService: PlanilhaVendasHibridaOpcionalService
  ) {}

  @Input() idOrcamentoCenario: number;
  @Input() totalTaxaAdministrativa: Cenario;
  @Input() isChangeOrder: boolean;
  @Input() readonly = false;
  @Input() gruposOpcionais = false;

  editComentarioTaxaAdministrativa = false;
  loading: AwInputStatus = 'completed';

  editComplementoPosition: ConnectedPosition = {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
    offsetY: 5,
    offsetX: -17,
  };

  currencyPrecision4: Partial<CurrencyMaskConfig> = { precision: 4 };

  salvarTaxaAdmin(objTaxas: Cenario, campo?: string): void {
    switch (campo) {
      case 'porcentotaxaadm':
        objTaxas.valorTaxaAdmistrativa = 0;
        break;
      case 'valortaxaadm':
        objTaxas.percentualTaxaAdministrativa = 0;
        break;
    }
    this.loading = 'loading';
    this.planilhaVendasHibridaService
      .gravarTaxasAdministrativa(objTaxas)
      .pipe(
        finalize(() => {
          this.loading = 'completed';
        })
      )
      .subscribe();
  }

  alterarBaseCalculoCenario(input: HTMLInputElement): void {
    this.loading = 'loading';
    this.planilhaVendasHibridaService
      .atualizarBaseCalculoCenario(this.idOrcamentoCenario)
      .pipe(
        tap((taxaEmPercentual: boolean) => {
          this.planilhaVendasHibridaService.updateCenario({ taxaEmPercentual });
        }),
        finalize(() => {
          this.loading = 'completed';
          this.focusSelect(input);
        })
      )
      .subscribe();
  }
  focusSelect(input: HTMLInputElement): void {
    setTimeout(() => {
      input.focus();
      input.select();
    }, 150);
  }
  ngOnInit(): void {}
}
