import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FamiliaGrupoOpcional,
  FornecedorOpcional,
  GrupaoOpcional,
  GrupoOpcional,
} from '../../../models/grupo-opcional';
import { trackByFactory } from '@aw-utils/track-by';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from 'ngx-currency';
import { PlanilhaVendasHibridaService } from '../../../planilha-vendas-hibrida.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ActivatedRoute } from '@angular/router';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { PlanilhaVendasHibridaOpcionalService } from '../../../planilha-vendas-hibrida-opcional.service';
import { tap } from 'rxjs/operators';
import { ComboImposto } from '../../../models/combo-imposto';
import { BehaviorSubject } from 'rxjs';
import { Cenario } from '@aw-models/cenario';

@Component({
  selector: 'app-ph-opcional-grupao-body',
  templateUrl: './ph-opcional-grupao-body.component.html',
  styleUrls: [
    './ph-opcional-grupao-body.component.scss',
    '../../../planilha-hibrida-grupos/planilha-hibrida-grupos.component.scss',
  ],
  animations: [collapseAnimation()],
})
export class PhOpcionalGrupaoBodyComponent implements OnInit {
  constructor(
    public planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private route: ActivatedRoute,
    private planilhaVendasHibridaOpcService: PlanilhaVendasHibridaOpcionalService
  ) {}
  @Input() grupao: GrupaoOpcional;
  @Input() familia: FamiliaGrupoOpcional;
  @Input() cenario: Cenario;
  trackByGrupao = trackByFactory<GrupaoOpcional>('idGrupao');
  trackByGrupo = trackByFactory<GrupoOpcional>('idOrcamentoGrupo');
  trackByFornecedor = trackByFactory<FornecedorOpcional>('idFornecedor');
  currencyPrecision10: Partial<CurrencyMaskConfig> = {
    precision: 10,
    inputMode: CurrencyMaskInputMode.NATURAL,
  };
  trackByComboImposto = trackByFactory<ComboImposto>('idOrcamentoCenarioGrupoContrato');
  idOrcamento = +this.route.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  idOrcamentoCenario = +this.route.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  ngModelOptions: any = { updateOn: 'blur' };
  isChangeOrder = false;
  editComplementoPosition: ConnectedPosition = {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
    offsetY: 5,
    offsetX: -17,
  };
  @Output() atualizarGrupo = new EventEmitter();

  _selectContratos$ = new BehaviorSubject<ComboImposto[]>([]);

  ngOnInit(): void {
    this.planilhaVendasHibridaService.getListaContratos().subscribe(contratos => {
      this._selectContratos$.next(contratos);
    });
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
    entity: GrupoOpcional,
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

  validaCalculaPlanilhaHibrida(grupo: GrupoOpcional, campo?: string): void {
    if (campo) {
      switch (campo) {
        case 'porcentodesconto':
          grupo.valorDesconto = 0;
          break;
        case 'valordesconto':
          grupo.percentualDesconto = 0;
          break;
        case 'porcentomargem':
          grupo.valorMargemEmbutida = 0;
          break;
        case 'valormargem':
          grupo.percentualMargemEmbutida = 0;
          break;
        case 'porcentooportunidade':
          grupo.valorOportunidade = 0;
          break;
        case 'valoroportunidade':
          grupo.percentualOportunidade = 0;
          break;
        case 'porcentodescontovp':
          grupo.valorDescontoVPDNN = 0;
          break;
        case 'valordescontovp':
          grupo.percentualDescontoVPDNN = 0;
          break;
      }
    }
    if (
      grupo.percentualDesconto ||
      grupo.percentualMargemEmbutida ||
      grupo.percentualOportunidade ||
      grupo.percentualDescontoVPDNN
    ) {
      if (grupo.percentualDesconto > 100) {
        grupo.percentualDesconto = 100;
      }
      if (grupo.percentualMargemEmbutida > 100) {
        grupo.percentualMargemEmbutida = 100;
      }
      if (grupo.percentualOportunidade > 100) {
        grupo.percentualOportunidade = 100;
      }
      if (grupo.percentualDescontoVPDNN > 100) {
        grupo.percentualDescontoVPDNN = 100;
      }

      if (grupo.percentualDesconto < 0) {
        grupo.percentualDesconto = 0;
      }
      if (grupo.percentualMargemEmbutida < 0) {
        grupo.percentualMargemEmbutida = 0;
      }
      if (grupo.percentualOportunidade < 0) {
        grupo.percentualOportunidade = 0;
      }
      if (grupo.percentualDescontoVPDNN < 0) {
        grupo.percentualDescontoVPDNN = 0;
      }
    }
    this.atualizarPlanilhaHibridaOpc(grupo);
  }

  cancelEditComentario(grupo: GrupoOpcional): void {
    grupo.editComentarioDesconto = false;
  }

  atualizarPlanilhaHibridaOpc<K extends keyof GrupoOpcional>(
    grupo: GrupoOpcional,
    property?: K,
    value?: GrupoOpcional[K]
  ): void {
    this.planilhaVendasHibridaOpcService
      .atualizarPlanilhaHibridaOpc(
        this.familia.idOrcamentoFamilia,
        this.grupao.idGrupao,
        {
          ...grupo,
          idOrcamentoCenarioFamilia: this.familia.idOrcamentoCenarioFamilia,
          idOrcamentoCenario: this.idOrcamentoCenario,
          valorTotal: grupo.valorTotal,
          valorTaxaAdmFamilia: this.familia.valorTaxaAdministrativa,
          baseFornecedor: false,
          percentualRefValorTotal: 0.0,
          percentualRefValorTotalVPDNN: 0.0,
          compraNegociacaoGrupo: null,
          planilhaHibridaFornecedor: null,
          planoCompraGrupoPlanilhaHibrida: null,
          grupoTaxa: null,
          grupoPlanoCompra: false,
          [property]: value,
        },
        this.idOrcamento,
        this.idOrcamentoCenario
      )
      .pipe(tap(() => this.atualizarGrupo.emit(this.familia.idOrcamentoCenarioFamilia)))
      .subscribe();
  }
  atualizarComentarioDesconto(grupo: GrupoOpcional): void {
    grupo.loadingComentarioDesconto = true;
    grupo.editComentarioDesconto = false;
    this.planilhaVendasHibridaService
      .atualizarComentarioDesconto(grupo.idPlanilhaHibrida, grupo.comentarioDesconto, this.idOrcamentoCenario)
      .subscribe(() => {
        grupo.editComentarioDesconto = false;
        grupo.loadingComentarioDesconto = false;
      });
  }
}
