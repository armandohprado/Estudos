import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlanilhaVendasHibridaService } from '../../../planilha-vendas-hibrida.service';
import { TotalFamilia } from '../../../models/total-familia';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from 'ngx-currency';
import { Entity } from '@aw-utils/types/entity';
import { PlanilhaHibrida } from '../../../models/grupo';
import { FamiliaGrupoOpcional, GrupaoOpcional } from '../../../models/grupo-opcional';
import { PlanilhaVendasHibridaOpcionalService } from '../../../planilha-vendas-hibrida-opcional.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-ph-opcional-grupao-header',
  templateUrl: './ph-opcional-grupao-header.component.html',
  styleUrls: [
    '../../../planilha-hibrida-grupos/planilha-hibrida-grupos.component.scss',
    './ph-opcional-grupao-header.component.scss',
  ],
})
export class PhOpcionalGrupaoHeaderComponent implements OnInit {
  @Input() grupao: GrupaoOpcional;
  @Input() familia: FamiliaGrupoOpcional;
  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  @Output() atualizarGrupao = new EventEmitter();

  isChangeOrder = false;

  totalFamilia: TotalFamilia = {
    percentualDesconto: 0,
    valorDesconto: 0,
    percentualMargem: 0,
    valorMargem: 0,
    percentualDescontoVPDNN: 0,
    valorDescontoVPDNN: 0,
    hideBtnApplyDesconto: false,
    hideBtnApplyMargem: false,
    hideBtnApplyDescontoVPDNN: false,
    hideLabelPercentualDesconto: false,
    hideLabelPercentualMargem: false,
    hideLabelPercentualDescontoVPDNN: false,
  } as TotalFamilia;
  ngModelOptions: any = { updateOn: 'blur' };
  currencyPrecision10: Partial<CurrencyMaskConfig> = {
    precision: 10,
    inputMode: CurrencyMaskInputMode.NATURAL,
  };
  objHeaderFamilia: any = {};

  collapses: Entity<boolean> = {
    isOpen_0: false,
  };

  constructor(
    public planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private planilhaVendasHibridaOpcionalService: PlanilhaVendasHibridaOpcionalService
  ) {}

  ngOnInit(): void {}

  hideShowCols(coluna: string): void {
    switch (coluna) {
      case 'desconto':
        this.planilhaVendasHibridaService.hideColDesconto = !this.planilhaVendasHibridaService.hideColDesconto;
        break;
      case 'margem':
        this.planilhaVendasHibridaService.hideColMargem = !this.planilhaVendasHibridaService.hideColMargem;
        break;
      case 'imposto':
        this.planilhaVendasHibridaService.hideColImposto = !this.planilhaVendasHibridaService.hideColImposto;
        break;
      case 'oportunidade':
        this.planilhaVendasHibridaService.hideColOportunidade = !this.planilhaVendasHibridaService.hideColOportunidade;
        break;
      case 'descontoVP':
        this.planilhaVendasHibridaService.hideColDescontoVPDNN = !this.planilhaVendasHibridaService
          .hideColDescontoVPDNN;
        break;
    }
  }

  validaCalculaHeaderFamilia(objTotalFamilia, campo): void {
    this.objHeaderFamilia.idOrcamentoCenarioFamilia = objTotalFamilia.idOrcamentoCenarioFamilia;
    this.objHeaderFamilia.idOrcamentoCenario = objTotalFamilia.idOrcamentoCenario;
    this.objHeaderFamilia.fixoFinalProposta = objTotalFamilia.fixoFinalProposta;

    objTotalFamilia.hideBtnApplyDesconto = false;
    objTotalFamilia.hideBtnApplyMargem = false;
    objTotalFamilia.hideBtnApplyDescontoVPDNN = false;

    if (campo) {
      switch (campo) {
        case 'porcentodesconto':
          objTotalFamilia.hideBtnApplyDesconto = true;
          objTotalFamilia.valorDesconto = 0;

          this.objHeaderFamilia.percentual =
            objTotalFamilia.percentualDesconto > 100 ? 100 : objTotalFamilia.percentualDesconto;
          this.objHeaderFamilia.valor = 0;
          this.objHeaderFamilia.origem = 1; // 1 - Desconto | 2 - Margem | 3 - Desconto VP DNN
          break;
        case 'valordesconto':
          objTotalFamilia.hideBtnApplyDesconto = true;
          objTotalFamilia.percentualDesconto = 0;

          this.objHeaderFamilia.percentual = 0;
          this.objHeaderFamilia.valor = objTotalFamilia.valorDesconto;
          this.objHeaderFamilia.origem = 1; // 1 - Desconto | 2 - Margem | 3 - Desconto VP DNN
          break;
        case 'porcentomargem':
          objTotalFamilia.hideBtnApplyMargem = true;
          objTotalFamilia.valorMargem = 0;

          this.objHeaderFamilia.percentual =
            objTotalFamilia.percentualMargem > 100 ? 100 : objTotalFamilia.percentualMargem;
          this.objHeaderFamilia.valor = 0;
          this.objHeaderFamilia.origem = 2; // 1 - Desconto | 2 - Margem | 3 - Desconto VP DNN
          break;
        case 'valormargem':
          objTotalFamilia.hideBtnApplyMargem = true;
          objTotalFamilia.percentualMargem = 0;

          this.objHeaderFamilia.percentual = 0;
          this.objHeaderFamilia.valor = objTotalFamilia.valorMargem;
          this.objHeaderFamilia.origem = 2; // 1 - Desconto | 2 - Margem | 3 - Desconto VP DNN
          break;
        case 'porcentodescontovp':
          objTotalFamilia.hideBtnApplyDescontoVPDNN = true;
          objTotalFamilia.valorDescontoVPDNN = 0;

          this.objHeaderFamilia.percentual =
            objTotalFamilia.percentualDescontoVPDNN > 100 ? 100 : objTotalFamilia.percentualDescontoVPDNN;
          this.objHeaderFamilia.valor = 0;
          this.objHeaderFamilia.origem = 3; // 1 - Desconto | 2 - Margem | 3 - Desconto VP DNN
          break;
        case 'valordescontovp':
          objTotalFamilia.hideBtnApplyDescontoVPDNN = true;
          objTotalFamilia.percentualDescontoVPDNN = 0;

          this.objHeaderFamilia.percentual = 0;
          this.objHeaderFamilia.valor = objTotalFamilia.valorDescontoVPDNN;
          this.objHeaderFamilia.origem = 3; // 1 - Desconto | 2 - Margem | 3 - Desconto VP DNN
          break;
      }
    }

    if (
      objTotalFamilia.percentualDesconto ||
      objTotalFamilia.percentualMargem ||
      objTotalFamilia.percentualOportunidade ||
      objTotalFamilia.percentualDescontoVPDNN
    ) {
      if (objTotalFamilia.percentualDesconto > 100) {
        objTotalFamilia.percentualDesconto = 100;
      }
      if (objTotalFamilia.percentualMargem > 100) {
        objTotalFamilia.percentualMargem = 100;
      }
      if (objTotalFamilia.percentualDescontoVPDNN > 100) {
        objTotalFamilia.percentualDescontoVPDNN = 100;
      }

      if (objTotalFamilia.percentualDesconto < 0) {
        objTotalFamilia.percentualDesconto = 0;
      }
      if (objTotalFamilia.percentualMargem < 0) {
        objTotalFamilia.percentualMargem = 0;
      }
      if (objTotalFamilia.percentualDescontoVPDNN < 0) {
        objTotalFamilia.percentualDescontoVPDNN = 0;
      }
    }
    this.calcularHeaderFamilia(objTotalFamilia);
  }

  calcularHeaderFamilia(objTotalFamilia: TotalFamilia): void {
    objTotalFamilia.loading = 'loading';
    this.planilhaVendasHibridaOpcionalService
      .putFamiliaGrupoOpcional({
        idOrcamentoCenarioFamilia: this.familia.idOrcamentoCenarioFamilia,
        idOrcamentoCenario: this.idOrcamentoCenario,
        fixoFinalProposta: this.objHeaderFamilia.fixoFinalProposta,
        origem: this.objHeaderFamilia.origem,
        valor: objTotalFamilia.valorDesconto || objTotalFamilia.valorMargem || objTotalFamilia.valorDescontoVPDNN,
        percentual:
          objTotalFamilia.percentualDesconto ||
          objTotalFamilia.percentualMargem ||
          objTotalFamilia.percentualDescontoVPDNN,
      })
      .pipe(
        tap(() => {
          this.atualizarGrupao.emit();
          this.resetFamilia();
          objTotalFamilia.loading = 'completed';
        })
      )
      .subscribe();
  }

  resetFamilia = () => {
    this.totalFamilia = {
      percentualDesconto: 0,
      valorDesconto: 0,
      percentualMargem: 0,
      valorMargem: 0,
      percentualDescontoVPDNN: 0,
      valorDescontoVPDNN: 0,
      hideBtnApplyDesconto: false,
      hideBtnApplyMargem: false,
      hideBtnApplyDescontoVPDNN: false,
      hideLabelPercentualDesconto: false,
      hideLabelPercentualMargem: false,
      hideLabelPercentualDescontoVPDNN: false,
    } as TotalFamilia;
  };

  alterarLabel(
    label:
      | 'labelPercentualDesconto'
      | 'labelPercentualMargemEmbutida'
      | 'labelPercentualOportunidade'
      | 'labelPercentualDescontoVPDNN'
      | 'hideLabelPercentualDesconto'
      | 'hideLabelPercentualMargem'
      | 'hideLabelPercentualDescontoVPDNN',
    entity: PlanilhaHibrida | TotalFamilia,
    input?: HTMLInputElement
  ): void {
    entity[label] = !entity[label];
    if (input) {
      setTimeout(() => {
        input.focus();
        input.select();
      });
    }
  }
}
