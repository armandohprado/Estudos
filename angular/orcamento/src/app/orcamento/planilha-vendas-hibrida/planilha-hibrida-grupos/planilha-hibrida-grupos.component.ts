import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { ComboImposto } from '../models/combo-imposto';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Grupao } from '../models/grupao';
import { OrcamentoCenarioFamilia } from '../models/cenario';
import { TotalFamilia } from '../models/total-familia';
import { PlanilhaHibrida, PlanilhaHibridaFornecedor, PlanilhaHibridaGrupo } from '../models/grupo';
import { Entity } from '@aw-utils/types/entity';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { Subject } from 'rxjs';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { TransferirSaldoChangeOrderComponent } from '../change-order/transferir-saldo-change-order/transferir-saldo-change-order.component';
import { TransferirSaldoCcComponent } from '../transferir-saldo-contrato/modal-transferir-saldo-cc/transferir-saldo-cc.component';
import { PlanilhaVendasHibridaService } from '../planilha-vendas-hibrida.service';
import { Projeto } from '../../../models';
import { trackByFactory } from '@aw-utils/track-by';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from 'ngx-currency';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-planilha-hibrida-grupos',
  templateUrl: './planilha-hibrida-grupos.component.html',
  styleUrls: ['./planilha-hibrida-grupos.component.scss'],
  animations: [fadeOutAnimation(), collapseAnimation()],
})
export class PlanilhaHibridaGruposComponent implements OnInit, OnDestroy {
  constructor(
    public planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private bsModalService: BsModalService
  ) {}

  private _destroy$ = new Subject<void>();

  @Input() idOrcamentoCenarioFamilia: number;
  @Input() grupao: Grupao;
  @Input() idOrcamento: number;
  @Input() first: boolean;
  @Input() selectContratos: ComboImposto[];
  @Input() isChangeOrder: boolean;
  @Input() familia: OrcamentoCenarioFamilia;
  @Input() idOrcamentoCenario: number;

  bsModalRef: BsModalRef;
  projeto: Projeto = this.activatedRoute.snapshot.data.projeto;

  collapses: Entity<boolean> = {
    isOpen_0: false,
  };

  currencyPrecision10: Partial<CurrencyMaskConfig> = {
    precision: 10,
    inputMode: CurrencyMaskInputMode.NATURAL,
  };

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

  isLoading = false;

  editComplementoPosition: ConnectedPosition = {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
    offsetY: 5,
    offsetX: -17,
  };

  objHeaderFamilia: any = {};

  ngModelOptions: any = { updateOn: 'blur' };

  trackByGrupo = trackByFactory<PlanilhaHibridaGrupo>('idOrcamentoGrupo');
  trackByComboImposto = trackByFactory<ComboImposto>('idOrcamentoCenarioGrupoContrato');
  trackByFornecedor = trackByFactory<PlanilhaHibridaFornecedor>('idPlanilhaHibridaFornecedor');

  openTransferirSaldo(planilhaHibridaGrupo: PlanilhaHibridaGrupo): void {
    this.bsModalService.show(TransferirSaldoChangeOrderComponent, {
      animated: true,
      initialState: {
        planilhaHibridaGrupo,
        idOrcamento: this.idOrcamento,
        idOrcamentoCenario: this.idOrcamentoCenario,
      },
      class: 'modal-xl',
    });
  }
  openTransferirSaldoCC(planilhaHibridaGrupo: PlanilhaHibridaGrupo): void {
    this.bsModalService.show(TransferirSaldoCcComponent, {
      animated: true,
      initialState: { planilhaHibridaGrupo, idOrcamento: this.idOrcamento },
      class: 'modal-xxl',
    });
  }

  updatePlanilhaHibrida<K extends keyof PlanilhaHibrida>(
    planilhaHibrida: PlanilhaHibrida,
    property: K,
    value: PlanilhaHibrida[K]
  ): void {
    this.planilhaVendasHibridaService
      .atualizarPlanilhaHibrida(
        this.familia.idOrcamentoFamilia,
        this.grupao.idGrupao,
        {
          ...planilhaHibrida,
          idOrcamentoCenarioFamilia: this.familia.idOrcamentoCenarioFamilia,
          [property]: value,
        },
        this.idOrcamento,
        this.idOrcamentoCenario
      )
      .subscribe();
  }

  validaCalculaPlanilhaHibrida(planilhaHibrida: PlanilhaHibrida, campo?: string): void {
    if (campo) {
      switch (campo) {
        case 'porcentodesconto':
          planilhaHibrida.valorDesconto = 0;
          break;
        case 'valordesconto':
          planilhaHibrida.percentualDesconto = 0;
          break;
        case 'porcentomargem':
          planilhaHibrida.valorMargemEmbutida = 0;
          break;
        case 'valormargem':
          planilhaHibrida.percentualMargemEmbutida = 0;
          break;
        case 'porcentooportunidade':
          planilhaHibrida.valorOportunidade = 0;
          break;
        case 'valoroportunidade':
          planilhaHibrida.percentualOportunidade = 0;
          break;
        case 'porcentodescontovp':
          planilhaHibrida.valorDescontoVPDNN = 0;
          break;
        case 'valordescontovp':
          planilhaHibrida.percentualDescontoVPDNN = 0;
          break;
      }
    }
    if (
      planilhaHibrida.percentualDesconto ||
      planilhaHibrida.percentualMargemEmbutida ||
      planilhaHibrida.percentualOportunidade ||
      planilhaHibrida.percentualDescontoVPDNN
    ) {
      if (planilhaHibrida.percentualDesconto > 100) {
        planilhaHibrida.percentualDesconto = 100;
      }
      if (planilhaHibrida.percentualMargemEmbutida > 100) {
        planilhaHibrida.percentualMargemEmbutida = 100;
      }
      if (planilhaHibrida.percentualOportunidade > 100) {
        planilhaHibrida.percentualOportunidade = 100;
      }
      if (planilhaHibrida.percentualDescontoVPDNN > 100) {
        planilhaHibrida.percentualDescontoVPDNN = 100;
      }

      if (planilhaHibrida.percentualDesconto < 0) {
        planilhaHibrida.percentualDesconto = 0;
      }
      if (planilhaHibrida.percentualMargemEmbutida < 0) {
        planilhaHibrida.percentualMargemEmbutida = 0;
      }
      if (planilhaHibrida.percentualOportunidade < 0) {
        planilhaHibrida.percentualOportunidade = 0;
      }
      if (planilhaHibrida.percentualDescontoVPDNN < 0) {
        planilhaHibrida.percentualDescontoVPDNN = 0;
      }
    }
    this.planilhaVendasHibridaService
      .atualizarPlanilhaHibrida(
        this.familia.idOrcamentoFamilia,
        this.grupao.idGrupao,
        {
          ...planilhaHibrida,
          idOrcamentoCenarioFamilia: this.familia.idOrcamentoCenarioFamilia,
        },
        this.idOrcamento,
        this.idOrcamentoCenario
      )
      .subscribe();
  }

  atualizaTotalFamilia(idOrcamentoCenarioFamilia, idOrcamentoCenario): void {
    this.planilhaVendasHibridaService.getTotalFamilia(idOrcamentoCenarioFamilia, idOrcamentoCenario).subscribe();
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
    this.planilhaVendasHibridaService
      .calcularColunasPlanilha(
        this.familia.idOrcamentoFamilia,
        this.grupao.idGrupao,
        this.objHeaderFamilia,
        this.idOrcamento
      )
      .pipe(
        finalize(() => {
          objTotalFamilia.loading = 'completed';
          objTotalFamilia.hideBtnApplyDesconto = false;
          objTotalFamilia.hideBtnApplyMargem = false;
          objTotalFamilia.hideBtnApplyDescontoVPDNN = false;
          objTotalFamilia.hideLabelPercentualDesconto = false;
          objTotalFamilia.hideLabelPercentualMargem = false;
          objTotalFamilia.hideLabelPercentualDescontoVPDNN = false;
        })
      )
      .subscribe((data: any) => {
        this.totalFamilia = data;
        this.atualizaTotalFamilia(this.idOrcamentoCenarioFamilia, this.idOrcamentoCenario);
      });
  }

  getTotalFamilia(idOrcamentoCenarioFamilia, idOrcamentoCenario): void {
    this.planilhaVendasHibridaService.getTotalFamilia(idOrcamentoCenarioFamilia, idOrcamentoCenario).subscribe(data => {
      this.totalFamilia = data;
      this.totalFamilia.loading = 'completed';
    });
  }

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
        this.planilhaVendasHibridaService.hideColDescontoVPDNN =
          !this.planilhaVendasHibridaService.hideColDescontoVPDNN;
        break;
    }
  }

  cancelEditComentario(planilhaHibrida: PlanilhaHibrida): void {
    planilhaHibrida.editComentarioDesconto = false;
  }

  atualizarComentarioDesconto(planilhaHibrida: PlanilhaHibrida): void {
    planilhaHibrida.loadingComentarioDesconto = true;
    this.planilhaVendasHibridaService
      .atualizarComentarioDesconto(
        planilhaHibrida.idPlanilhaHibrida,
        planilhaHibrida.comentarioDesconto,
        this.idOrcamentoCenario
      )
      .subscribe(() => {
        planilhaHibrida.editComentarioDesconto = false;
        planilhaHibrida.loadingComentarioDesconto = false;
      });
  }

  baseFornecedor(idPlanilhaHibrida: number, baseFornecedor: boolean): void {
    this.planilhaVendasHibridaService
      .baseFornecedor(idPlanilhaHibrida, baseFornecedor, this.idOrcamentoCenario)
      .subscribe();
  }

  ngOnInit(): void {
    if (this.first) {
      this.getTotalFamilia(this.idOrcamentoCenarioFamilia, this.idOrcamentoCenario);
    }
    if (!this.grupao.grupos?.length) {
      const idOrcamentoGrupoParam = this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.idOrcamentoGrupo);
      let idOrcamentoGrupoAtivo = 0;
      const idGrupao = this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.idGrupao);
      if (idOrcamentoGrupoParam && idGrupao && +idGrupao === this.grupao.idGrupao) {
        idOrcamentoGrupoAtivo = +idOrcamentoGrupoParam;
        this.router.navigate([], { relativeTo: this.activatedRoute }).then();
      }
      this.planilhaVendasHibridaService
        .getGrupao(
          this.grupao.idGrupao,
          this.idOrcamentoCenario,
          this.familia.idOrcamentoFamilia,
          idOrcamentoGrupoAtivo
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

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
