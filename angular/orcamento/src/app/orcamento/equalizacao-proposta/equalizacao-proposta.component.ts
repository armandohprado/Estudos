import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { EpPropostaItemQuery } from './state/item/ep-proposta-item.query';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { EqualizacaoPropostaService } from './equalizacao-proposta.service';
import { trackByEpPropostaItem } from './utils';

@Component({
  selector: 'app-equalizacao-proposta',
  templateUrl: './equalizacao-proposta.component.html',
  styleUrls: ['./equalizacao-proposta.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EqualizacaoPropostaComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    public epPropostaItemQuery: EpPropostaItemQuery,
    private equalizacaoPropostaService: EqualizacaoPropostaService
  ) {}

  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  @Input() idOrcamentoGrupo: number;
  @Input() idProjeto: number;

  trackByEpPropostaItem = trackByEpPropostaItem;

  ngOnInit(): void {
    const paramMap = this.activatedRoute.snapshot.paramMap;
    this.idOrcamento ??= +paramMap.get(RouteParamEnum.idOrcamento);
    this.idOrcamentoCenario ??= +paramMap.get(RouteParamEnum.idOrcamentoCenario);
    this.idOrcamentoGrupo ??= +paramMap.get(RouteParamEnum.idOrcamentoGrupo);
    this.idProjeto ??= +paramMap.get(RouteParamEnum.idProjeto);
    const fornecedorHeaderOpened = this.activatedRoute.snapshot.queryParamMap.get('fornecedorHeaderOpened');
    if (coerceBooleanProperty(fornecedorHeaderOpened)) {
      this.equalizacaoPropostaService.toggleCollapseHeaderFornecedor();
    }
  }

  ngOnDestroy(): void {
    this.equalizacaoPropostaService.clearState();
  }
}
