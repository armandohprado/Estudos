import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CnGrupo, CnTipoGrupoEnum } from '../../../models/cn-grupo';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { CnFornecedor } from '../../../models/cn-fornecedor';
import { debounceTime, shareReplay, startWith, takeUntil, tap } from 'rxjs/operators';
import { CcGrupoService } from '../../state/grupos/cc-grupo.service';
import { ControleComprasQuery } from '../../state/controle-compras/controle-compras.query';
import { GrupoTransferencia } from '@aw-models/controle-compras/grupo-transferencia';
import { minBy } from 'lodash-es';
import { PlanilhaHibridaTransferirSaldoCC } from '../../../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';
import { ControleComprasService } from '../../state/controle-compras/controle-compras.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CcGrupoQuery } from '../../state/grupos/cc-grupo.query';
import { CnClassificacao } from '../../../models/cn-classificacao';
import { EmpresaFaturamento } from '@aw-models/empresa-faturamento';
import { AwSelectOption } from '@aw-components/aw-select/aw-select.type';
import { awSelectComparatorFactory } from '@aw-components/aw-select/aw-select.config';
import { PlanoCompraQuestao } from '@aw-models/plano-compra-questao';

@Component({
  selector: 'app-valores-envio-mapa',
  templateUrl: './valores-envio-mapa.component.html',
  styleUrls: [
    '../../../shared-compra/fornecedores-envio-mapa/fornecedores-envio-mapa.component.scss',
    './valores-envio-mapa.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValoresEnvioMapaComponent implements OnInit, OnDestroy {
  constructor(
    public ccGruposService: CcGrupoService,
    public controleComprasQuery: ControleComprasQuery,
    private controleComprasService: ControleComprasService,
    private routerQuery: RouterQuery,
    private ccGruposQuery: CcGrupoQuery,
    public changeDetectorRef: ChangeDetectorRef
  ) {}

  private _destroy$ = new Subject<void>();
  tipoGrupo = CnTipoGrupoEnum;

  fornecedoresSelecionados$ = this.routerQuery
    .selectParams(RouteParamEnum.idCompraNegociacaoGrupo)
    .pipe(this.ccGruposQuery.selectFornecedorSelecionadosOperator());

  @Input() grupo: CnGrupo;
  @Input() formEnvioMapa: FormGroup;

  valorMiscellaneous$: Observable<number>;
  readonly origemCompraLista$ = this.controleComprasQuery.tiposFicha$;

  classificacaoComparator = awSelectComparatorFactory<CnClassificacao>('idConfirmacaoCompraClassificacao');
  faturamentoCobrancaComparator = awSelectComparatorFactory<EmpresaFaturamento>('idFaturamentoCobranca');

  get valorMiscellaneousControl(): FormControl {
    return this.formEnvioMapa.get('valorMetaMiscellaneous') as FormControl;
  }

  get valorSaldoContingenciaControl(): FormControl {
    return this.formEnvioMapa.get('valorSaldoContingencia') as FormControl;
  }

  get valorMargemDiferencaControl(): FormControl {
    return this.formEnvioMapa.get('valorMargemDiferenca') as FormControl;
  }

  get tipoSelecaoFornecedorControl(): FormControl {
    return this.formEnvioMapa.get('tipoSelecaoFornecedor') as FormControl;
  }

  get compraNegociacaoGrupoFichaControl(): FormGroup | undefined {
    return this.formEnvioMapa.get('compraNegociacaoGrupoFicha') as FormGroup;
  }

  get fornecedorFichaControl(): FormControl | undefined {
    return this.compraNegociacaoGrupoFichaControl?.get('fornecedor') as FormControl;
  }

  get detalheControl(): FormControl | undefined {
    return this.compraNegociacaoGrupoFichaControl?.get('detalhe') as FormControl;
  }

  get tipoFicha(): FormControl | undefined {
    return this.compraNegociacaoGrupoFichaControl?.get('idTipoFicha') as FormControl;
  }

  get confirmacaoCompraClassificacaoControl(): FormControl | undefined {
    return this.formEnvioMapa?.get('confirmacaoCompraClassificacao') as FormControl;
  }

  get faturamentoCobrancaControl(): FormControl | undefined {
    return this.formEnvioMapa?.get('faturamentoCobranca') as FormControl;
  }

  get dataFluxoSDControl(): FormControl | undefined {
    return this.formEnvioMapa?.get('dataFluxoSD') as FormControl;
  }

  classificacaoItemDisabled = (item: AwSelectOption<CnClassificacao>) => !item.data.ativo;

  updateTransferenciaGrupo(grupo: GrupoTransferencia): void {
    grupo = {
      ...grupo,
      valorSaldoUtilizado:
        (grupo.valorSaldoContingenciaReservado === 0 ? grupo.valorSaldo : grupo.valorSaldoContingenciaReservado) -
        grupo.transferencia,
    };
    this.ccGruposService.updateGrupoTransferencia(this.grupo.idCompraNegociacaoGrupo, grupo);
  }

  updateTransferenciaGrupoCC(grupoTransferencia: PlanilhaHibridaTransferirSaldoCC[]): void {
    this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { gruposTransferenciaCC: grupoTransferencia });
  }

  updateFornecedores(fornecedoresSelecionados: CnFornecedor[]): void {
    const grupoFornecedorMenorValor = minBy(fornecedoresSelecionados, 'valorTotalOrcado');
    this.ccGruposService.updateGrupoCallback(this.grupo.idCompraNegociacaoGrupo, grupo => ({
      ...grupo,
      gruposFornecedores: grupo.gruposFornecedores.map(fornecedor => ({
        ...fornecedor,
        selecionado: fornecedoresSelecionados.some(
          fornecedorSelecionado => fornecedorSelecionado.idFornecedor === fornecedor.idFornecedor
        ),
      })),
      grupoFornecedorMenorValor,
    }));

    const totalOrcado = grupoFornecedorMenorValor?.valorTotalOrcado ?? 0;
    const valorMiscellaneous = arredondamento(this.grupo.valorUtilizado - totalOrcado, 2);
    if (this.grupo.tipo === this.tipoGrupo.Refaturado) {
      this.gerarSaldoContingencia(valorMiscellaneous);
    } else {
      this.valorSaldoContingenciaControl.setValue(0);
    }
    this.valorMiscellaneousControl.setValue(valorMiscellaneous);
    this.valorMargemDiferencaControl.setValue(valorMiscellaneous);
    this.valorSaldoContingenciaControl.updateValueAndValidity();
    this.formEnvioMapa.get(['compraNegociacaoGrupoFicha', 'detalhe']).updateValueAndValidity();
    if (fornecedoresSelecionados.length) {
      const fornecedorSelecionadoFicha: CnFornecedor | null = this.fornecedorFichaControl.value;
      if (
        !fornecedorSelecionadoFicha ||
        !fornecedoresSelecionados.some(
          fornecedor => fornecedor.idFornecedor === fornecedorSelecionadoFicha.idFornecedor
        )
      ) {
        this.fornecedorFichaControl.setValue(fornecedoresSelecionados[0]);
      }
    } else {
      this.fornecedorFichaControl.setValue(null);
    }
  }

  gerarSaldoContingencia(valor: number): void {
    const valorMisc = arredondamento(
      this.grupo.valorUtilizado - (this.grupo.grupoFornecedorMenorValor?.valorTotalOrcado ?? 0) - valor,
      2
    );
    this.valorMiscellaneousControl.setValue(valorMisc);
    this.valorMargemDiferencaControl.updateValueAndValidity({
      emitEvent: false,
    });
  }

  onPlanoCompraQuestaoChange($event: PlanoCompraQuestao): void {
    this.ccGruposService.updateGrupoPlanoCompraQuestao(
      this.grupo.idCompraNegociacaoGrupo,
      $event.idPlanoCompraQuestao,
      $event
    );
  }

  ngOnInit(): void {
    this.ccGruposService.getSetTransferenciaCC(this.grupo.idOrcamento, this.grupo.idPlanilhaHibrida);
    this.valorSaldoContingenciaControl.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(100),
        tap(valorSaldoContingencia => {
          this.gerarSaldoContingencia(valorSaldoContingencia);
        })
      )
      .subscribe();

    this.valorMiscellaneous$ = this.valorMiscellaneousControl.valueChanges.pipe(
      startWith(this.valorMiscellaneousControl.value as number),
      shareReplay()
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  formChange($event): void {
    const { origemEstouro } = $event ?? null;
    this.tipoFicha.setValue(origemEstouro);
  }
}
