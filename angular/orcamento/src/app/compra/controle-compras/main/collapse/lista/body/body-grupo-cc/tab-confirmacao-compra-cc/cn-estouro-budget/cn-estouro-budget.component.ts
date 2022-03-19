import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CcGrupoService } from '../../../../../../../state/grupos/cc-grupo.service';
import { StateComponent } from '@aw-shared/components/common/state-component';
import { CnGrupo, CnGrupoEstouroBudgetForm } from '../../../../../../../../models/cn-grupo';
import { TransferenciaCC } from '@aw-models/transferencia-cc';
import { finalize, map, pluck, switchMapTo, takeUntil, tap } from 'rxjs/operators';
import { GrupoTransferencia } from '@aw-models/controle-compras/grupo-transferencia';
import { PlanilhaHibridaTransferirSaldoCC } from '../../../../../../../../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { ControleComprasQuery } from '../../../../../../../state/controle-compras/controle-compras.query';
import { ControleComprasService } from '../../../../../../../state/controle-compras/controle-compras.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchAndThrow, refresh } from '@aw-utils/rxjs/operators';
import { filterCenarioGrupo } from '../../../../../../../../shared-compra/transferencia-cc/pipes/filter-cenario-grupo.pipe';
import { filterNilValue } from '@datorama/akita';
import { combineLatest, forkJoin } from 'rxjs';
import {
  CnFichaPayload,
  CnFichaPayloadCompraNegociacaoGrupoFichaTransacao,
  CnFichaPayloadCompraNegociacaoGrupoFichaTransacaoCC,
} from '../../../../../../../../models/cn-ficha-payload';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { OrcamentoGrupoFichaTipoEnum } from '@aw-models/orcamento-grupo-ficha-tipo.enum';
import { CnFichaAlt } from '../../../../../../../../models/cn-ficha-alt';

interface CnEstouroBudgetComponentState {
  loading: boolean;
  loadingCC: boolean;
  transferenciaCC: TransferenciaCC[];
  enviandoFicha: boolean;
  readonly: boolean;
  grupo?: CnGrupo;
}

@Component({
  selector: 'app-cn-estouro-budget',
  templateUrl: './cn-estouro-budget.component.html',
  styleUrls: ['./cn-estouro-budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnEstouroBudgetComponent extends StateComponent<CnEstouroBudgetComponentState> implements OnInit {
  constructor(
    public ccGruposService: CcGrupoService,
    public controleComprasQuery: ControleComprasQuery,
    private controleComprasService: ControleComprasService,
    private awDialogService: AwDialogService
  ) {
    super(
      {
        loading: false,
        loadingCC: false,
        transferenciaCC: [],
        enviandoFicha: false,
        readonly: false,
      },
      { inputs: ['readonly', 'grupo'] }
    );
  }

  @Input() idProjeto: number;
  @Input() idOrcamento: number;
  @Input() grupo: CnGrupo;
  @Input() readonly: boolean;
  @Input() readonlyFicha: CnFichaAlt;

  readonly grupo$ = this.selectState('grupo').pipe(filterNilValue());
  readonly readonly$ = this.selectState('readonly');
  readonly gruposTransferencia$ = combineLatest([this.grupo$.pipe(pluck('gruposTransferencia')), this.readonly$]).pipe(
    map(([gruposTransferencia, readonly]) => {
      if (readonly) {
        return (gruposTransferencia ?? []).filter(grupo => grupo.transferencia > 0);
      }
      return gruposTransferencia;
    })
  );
  readonly loading$ = this.selectState('loading');
  readonly loadingCC$ = this.selectState('loadingCC');
  readonly enviandoFicha$ = this.selectState('enviandoFicha');
  readonly transferenciaCC$ = this.selectState('transferenciaCC');
  readonly gruposTransferenciaCC$ = this.transferenciaCC$.pipe(filterNilValue(), map(filterCenarioGrupo));
  readonly origemCompraLista$ = this.controleComprasQuery.tiposFicha$;

  readonly form = new FormGroup(
    {
      detalhe: new FormControl('', [Validators.required]),
      origemEstouro: new FormControl(null, [Validators.required]),
    },
    { updateOn: 'blur' }
  );

  enviarFicha(): void {
    this.updateState({ enviandoFicha: true });
    const { detalhe, origemEstouro } = this.form.value as CnGrupoEstouroBudgetForm;
    const proposta = this.grupo.grupoOrcamento.propostas.find(_proposta => _proposta.equalizacaoSelecionada);
    if (!proposta?.fornecedor) {
      this.awDialogService.error('Não foi encontrado nenhuma proposta selecionada nesse grupo');
      return;
    }
    const compraNegociacaoGrupoFichaTransacao: CnFichaPayloadCompraNegociacaoGrupoFichaTransacao[] =
      this.grupo.gruposTransferencia
        .filter(grupo => grupo.transferencia > 0)
        .map(grupo => ({ idCompraNegociacaoGrupoOrigem: grupo.idCompraNegociacaoGrupo, valor: grupo.transferencia }));
    const compraNegociacaoGrupoFichaTransacaoCC: CnFichaPayloadCompraNegociacaoGrupoFichaTransacaoCC[] =
      this.grupo.gruposTransferenciaCC.filter(grupo => grupo.valorTransferido > 0);
    const payload: CnFichaPayload = {
      detalhe,
      compraNegociacaoGrupoFichaTipoAreaCausa: [
        {
          idFichaArea: null,
          idFichaCausa: null,
          idCompraNegociacaoGrupoFichaTipo: this.grupo.grupoNaoPrevisto
            ? OrcamentoGrupoFichaTipoEnum.CustoNaoPrevisto
            : OrcamentoGrupoFichaTipoEnum.EstouroDeBudget,
        },
      ],
      idCompraNegociacaoGrupo: this.grupo.idCompraNegociacaoGrupo,
      idGrupo: this.grupo.idGrupo,
      idProjeto: this.idProjeto,
      idFornecedor: proposta.fornecedor.idFornecedor,
      idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
      compraNegociacaoGrupoFichaTransacaoCC,
      compraNegociacaoGrupoFichaArquivo: [],
      compraNegociacaoGrupoFichaTransacao,
      idTipoFicha: origemEstouro,
    };
    const refresh$ = forkJoin([
      this.ccGruposService
        .getClassificacoes(this.grupo.idCompraNegociacaoGrupo)
        .pipe(switchMapTo(this.ccGruposService.getConfirmacaoCompras(this.grupo.idCompraNegociacaoGrupo))),
      this.ccGruposService.getFornecedoresConfirmacaoCompra(
        this.grupo.idCompraNegociacaoGrupo,
        this.grupo.grupoTaxa,
        this.grupo.permitidoEmitirCcSemMapa
      ),
      this.ccGruposService.getMiscellaneousConfirmacaoCompra(this.grupo.idCompraNegociacaoGrupo),
      this.ccGruposService.getAllFlags(this.grupo.idCompraNegociacaoGrupo),
      this.ccGruposService.getFichas(this.grupo.idCompraNegociacaoGrupo),
    ]);
    this.ccGruposService
      .enviarFicha(payload)
      .pipe(
        refresh(refresh$),
        finalize(() => {
          this.updateState({ enviandoFicha: false });
          this.form.setValue({ detalhe: '', origemEstouro: null });
          this.ccGruposService.resetGruposTransferencia(this.grupo.idCompraNegociacaoGrupo);
        })
      )
      .subscribe();
  }

  updateTransferenciaGrupo(grupo: GrupoTransferencia): void {
    this.ccGruposService.updateGrupoTransferencia(this.grupo.idCompraNegociacaoGrupo, {
      ...grupo,
      valorSaldoUtilizado:
        (grupo.valorSaldoContingenciaReservado === 0 ? grupo.valorSaldo : grupo.valorSaldoContingenciaReservado) -
        grupo.transferencia,
    });
  }

  updateTransferenciaGrupoCC(grupoTransferencia: PlanilhaHibridaTransferirSaldoCC[]): void {
    this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { gruposTransferenciaCC: grupoTransferencia });
  }

  ngOnInit(): void {
    const { idCompraNegociacaoGrupo, idCompraNegociacao, tipo, idPlanilhaHibrida } = this.grupo;
    if (this.grupo.formEstouroBudget) {
      this.form.patchValue(this.grupo.formEstouroBudget);
    }
    this.updateState({ loading: true, loadingCC: false });
    // Carrega os grupos para transferencia de saldo
    this.ccGruposService
      .getGruposTransferencia(idCompraNegociacaoGrupo, idCompraNegociacao, tipo)
      .pipe(
        finalize(() => {
          this.updateState({ loading: false });
        })
      )
      .subscribe();

    this.ccGruposService
      .getCCSaldoDisponivel(this.idOrcamento, idPlanilhaHibrida)
      .pipe(
        tap(transferenciaCC => {
          this.updateState({ transferenciaCC, loadingCC: false });
        }),
        catchAndThrow(() => {
          this.updateState({ loadingCC: false });
        })
      )
      .subscribe();

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(({ files, ...formEstouroBudget }) => {
      this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { formEstouroBudget });
    });

    if (this.readonly && this.readonlyFicha) {
      this.form.patchValue({ detalhe: this.readonlyFicha.detalhe, origemEstouro: this.readonlyFicha.idTipoFicha });
    }
  }
}
