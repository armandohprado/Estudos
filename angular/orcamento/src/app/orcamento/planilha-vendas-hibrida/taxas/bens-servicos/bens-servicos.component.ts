import { Component, Input, OnInit } from '@angular/core';
import { Cenario } from '../../models/cenario';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { PlanilhaVendasHibridaService } from '../../planilha-vendas-hibrida.service';
import { CurrencyMaskConfig } from 'ngx-currency';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-bens-servicos',
  templateUrl: './bens-servicos.component.html',
  styleUrls: ['./bens-servicos.component.scss'],
})
export class BensServicosComponent implements OnInit {
  constructor(public planilhaVendasHibridaService: PlanilhaVendasHibridaService) {}

  @Input() idOrcamentoCenario: number;
  @Input() totalTaxasBensServicos: Cenario;
  @Input() isChangeOrder: boolean;
  @Input() readonly = false;

  editComentarioTaxaBensServicos = false;
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

  gravarTaxaComentarioBensServicos(objTaxas): void {
    this.loading = 'loading';
    this.planilhaVendasHibridaService
      .gravarTaxaBensServicos(objTaxas)
      .pipe(
        finalize(() => {
          this.loading = 'completed';
        })
      )
      .subscribe();

    this.editComentarioTaxaBensServicos = false;
  }

  ngOnInit(): void {}
}
