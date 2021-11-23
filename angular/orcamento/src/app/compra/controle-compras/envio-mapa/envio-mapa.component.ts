import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CcGrupoQuery } from '../state/grupos/cc-grupo.query';
import { auditTime, finalize, takeUntil } from 'rxjs/operators';
import { CnGrupo, CnTipoGrupoEnum } from '../../models/cn-grupo';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { Observable, Subject } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CnEnvioMapaPayload, CnMapa } from '../../models/cn-mapa';
import { catchAndThrow, refreshMap } from '@aw-utils/rxjs/operators';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';
import { TipoSelecaoFornecedorEnum } from '../../shared-compra/fornecedores-envio-mapa/fornecedores-envio-mapa.component';
import { filterFornecedoresSelecionados, isEstouroBudget } from '../../shared-compra/util';
import { OrcamentoGrupoFichaTipoEnum } from '@aw-models/orcamento-grupo-ficha-tipo.enum';
import { ValoresEnvioMapaComponent } from './valores-envio-mapa/valores-envio-mapa.component';
import { cnCreateValidatorDataFluxoSD } from '../util';

@Component({
  selector: 'app-envio-mapa',
  templateUrl: './envio-mapa.component.html',
  styleUrls: ['./envio-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvioMapaComponent implements OnInit, OnDestroy {
  constructor(
    private ccGruposQuery: CcGrupoQuery,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private ccGruposService: CcGrupoService,
    private awDialogService: AwDialogService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private readonly _destroy$ = new Subject<void>();

  @ViewChild(ValoresEnvioMapaComponent) valoresEnvioMapaComponent?: ValoresEnvioMapaComponent;

  get valorMiscellaneousControl(): FormControl | undefined {
    return this.formEnvioMapa?.get('valorMetaMiscellaneous') as FormControl;
  }

  get valorMargemDiferencaControl(): FormControl | undefined {
    return this.formEnvioMapa?.get('valorMargemDiferenca') as FormControl;
  }

  grupo$: Observable<CnGrupo>;
  formEnvioMapa: FormGroup;
  idCompraNegociacaoGrupo = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);

  saving = false;

  getGrupoSnapshot(): CnGrupo {
    return this.ccGruposQuery.getEntity(this.idCompraNegociacaoGrupo);
  }

  voltar(): void {
    this.router
      .navigate(['../../'], {
        relativeTo: this.activatedRoute,
        queryParams: { [RouteParamEnum.idCompraNegociacaoGrupo]: this.idCompraNegociacaoGrupo },
      })
      .then();
  }

  /**
   * @description Valor Saldo Contingencia + Valor Miscellaneous não pode ser maior que o
   * valorUtilizado (valor do grupo) - totalOrcado (total orçado de todos os fornecedores)
   */
  menorZeroSaldoContingenciaValidator({ value, parent }: AbstractControl): ValidationErrors | null {
    const valorMiscellaneousControl = parent?.get('valorMetaMiscellaneous');
    if (!valorMiscellaneousControl || !this.idCompraNegociacaoGrupo) {
      return null;
    }
    const grupo = this.ccGruposQuery.buscarId(this.idCompraNegociacaoGrupo);
    if (grupo.grupoNaoPrevisto) {
      return null;
    }
    const totalSelecionado = grupo.grupoFornecedorMenorValor?.valorTotalOrcado ?? 0;
    const total = arredondamento(grupo.valorUtilizado - totalSelecionado, 2);
    const valorMisc = arredondamento(total - value, 2);
    if (total >= 0) {
      const valorCalculado = value + Math.max(valorMisc, 0);
      if (valorCalculado > total) {
        return { maiorQueDiferenca: true };
      }
    }

    return null;
  }

  /**
   * @description Valida se a ficha (form) está preenchido quando é um caso Estouro de Budget
   */
  validaFichaEstouro(control: AbstractControl): ValidationErrors | null {
    const grupo = this.getGrupoSnapshot();
    if (grupo.grupoNaoPrevisto) {
      return null;
    }
    if (isEstouroBudget(this.valorMargemDiferencaControl?.value ?? 0)) {
      return Validators.required(control);
    }
    return null;
  }

  validaFornecedorFicha(control: AbstractControl): ValidationErrors | null {
    const grupo = this.getGrupoSnapshot();
    return isEstouroBudget(this.valorMargemDiferencaControl?.value ?? 0) || grupo.grupoNaoPrevisto
      ? Validators.required(control)
      : null;
  }

  setFormEnvioMapa(): void {
    const grupo = this.getGrupoSnapshot();
    this.formEnvioMapa = this.formBuilder.group({
      idCompraNegociacaoGrupo: grupo.idCompraNegociacaoGrupo,
      idGrupo: grupo.idGrupo,
      idProjeto: +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjeto),
      valorVendaCongelada: grupo.valorVendaCongelada,
      valorCompraCongelada: grupo.valorCompraCongelada,
      valorEmissaoCC: grupo.valorEmissaoCC,
      valorSaldoContingencia: this.formBuilder.control(0, [this.menorZeroSaldoContingenciaValidator.bind(this)]),
      valorMetaCompra: grupo.valorMetaCompra,
      valorLimiteCompra: grupo.valorLimiteCompra,
      valorMargemRevenda: grupo.valorMargemRevenda,
      valorImposto:
        grupo.tipo === CnTipoGrupoEnum.Direto ? 0 : grupo.valorVendaCongelada * (grupo.percentualImposto / 100),
      valorMargemDiferenca: 0,
      valorMetaMiscellaneous: 0,
      compraNegociacaoGrupoFicha: this.formBuilder.group({
        idCompraNegociacaoGrupo: grupo.idCompraNegociacaoGrupo,
        detalhe: ['', [this.validaFichaEstouro.bind(this)]],
        compraNegociacaoGrupoFichaTransacao: [],
        compraNegociacaoGrupoFichaTransacaoCC: [],
        idTipoFicha: null,
        fornecedor: [null, [this.validaFornecedorFicha.bind(this)]],
      }),
      tipoSelecaoFornecedor: [TipoSelecaoFornecedorEnum.semConcorrencia],
      confirmacaoCompraClassificacao: [null, [Validators.required]],
      faturamentoCobranca: [null, [Validators.required]],
      dataFluxoSD: [null, [cnCreateValidatorDataFluxoSD(grupo)]],
    });
  }

  private _enviarMapa(payload: CnEnvioMapaPayload, grupo: CnGrupo): Observable<CnMapa> {
    let envioMapa$ = this.ccGruposService.envioMapa(payload);
    // Se o grupo não possuir central de compras, o mapa já é aprovado logo após a criação
    if (!grupo.centralCompras) {
      envioMapa$ = envioMapa$.pipe(
        refreshMap(mapa =>
          this.ccGruposService.aprovarMapa(mapa.idCompraNegociacaoGrupo, mapa.idCompraNegociacaoGrupoMapa)
        )
      );
    }
    return envioMapa$;
  }

  enviarMapa(grupo: CnGrupo): void {
    this.saving = true;
    const payload: CnEnvioMapaPayload = this.formEnvioMapa.value;
    const fornecedoresSelecionados = filterFornecedoresSelecionados(grupo.gruposFornecedores);
    // Verifica se é estouro de budget
    if (isEstouroBudget(payload.valorMargemDiferenca)) {
      payload.compraNegociacaoGrupoFicha.compraNegociacaoGrupoFichaTipoAreaCausa = [
        {
          idFichaArea: null,
          idFichaCausa: null,
          idCompraNegociacaoGrupoFichaTipo: grupo.grupoNaoPrevisto
            ? OrcamentoGrupoFichaTipoEnum.CustoNaoPrevisto
            : OrcamentoGrupoFichaTipoEnum.EstouroDeBudget,
        },
      ];
      payload.compraNegociacaoGrupoFicha.compraNegociacaoGrupoFichaTransacaoCC = grupo.gruposTransferenciaCC.filter(
        grupoTransferencia => grupoTransferencia.valorTransferido > 0
      );
      payload.compraNegociacaoGrupoFicha.compraNegociacaoGrupoFichaTransacao = grupo.gruposTransferencia
        .filter(grupoTransferencia => grupoTransferencia.transferencia > 0)
        .map(grupoTransferencia => ({
          idCompraNegociacaoGrupoOrigem: grupoTransferencia.idCompraNegociacaoGrupo,
          valor: grupoTransferencia.transferencia,
        }));
      if (payload.compraNegociacaoGrupoFicha.fornecedor) {
        payload.compraNegociacaoGrupoFicha.idFornecedor = payload.compraNegociacaoGrupoFicha.fornecedor.idFornecedor;
        payload.compraNegociacaoGrupoFicha.fornecedor = undefined;
      }
    } else {
      payload.compraNegociacaoGrupoFicha = null;
    }
    if (payload.confirmacaoCompraClassificacao) {
      payload.idConfirmacaoCompraClassificacao =
        payload.confirmacaoCompraClassificacao.idConfirmacaoCompraClassificacao;
      payload.confirmacaoCompraClassificacao = undefined;
    }
    if (payload.faturamentoCobranca) {
      payload.idFaturamentoCobranca = payload.faturamentoCobranca.idFaturamentoCobranca;
      payload.faturamentoCobranca = undefined;
    }
    if (grupo.tipo === CnTipoGrupoEnum.Direto) {
      payload.valorMargemRevenda = 0;
    } else {
      payload.valorMargemRevenda = payload.valorMargemDiferenca;
      payload.valorMargemDiferenca = 0;
      // modificando miscellaneous para o saldo de contigencia caso o grupo for refatorado
      payload.valorSaldoContingencia = payload.valorMetaMiscellaneous;
      payload.valorMetaMiscellaneous = 0;
    }
    payload.idsFornecedoresSelecionados = fornecedoresSelecionados.map(fornecedor => fornecedor.idFornecedor);
    payload.planoCompraQuestoes = (grupo.planoCompraQuestoes ?? []).map(({ idPlanoCompraQuestao, resposta }) => ({
      idPlanoCompraQuestao,
      resposta,
    }));

    this._enviarMapa(payload, grupo)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetectorRef.markForCheck();
        }),
        catchAndThrow(err => {
          this.awDialogService.error(
            'Erro ao tentar enviar o mapa',
            err?.error?.mensagem ?? 'Ocorreu um erro interno ao tentar enviar o mapa, tente novamente mais tarde!'
          );
        })
      )
      .subscribe(() => {
        this.awDialogService.success({
          title: 'Mapa Enviado com sucesso',
          secondaryBtn: {
            action: bsModalRef => {
              bsModalRef.hide();
              this.voltar();
            },
            title: 'Voltar',
          },
        });
      });
  }

  onMouseenter(): void {
    this.formEnvioMapa.markAllAsTouched();
    this.valoresEnvioMapaComponent?.changeDetectorRef.markForCheck();
  }

  ngOnInit(): void {
    this.grupo$ = this.ccGruposQuery.selectEntity(this.idCompraNegociacaoGrupo);
    this.setFormEnvioMapa();
    this.formEnvioMapa.valueChanges.pipe(takeUntil(this._destroy$), auditTime(50)).subscribe(() => {
      const compraNegociacaoGrupoFichaControl = this.formEnvioMapa.get('compraNegociacaoGrupoFicha');
      this.formEnvioMapa.get('valorSaldoContingencia').updateValueAndValidity({ emitEvent: false });
      compraNegociacaoGrupoFichaControl.get('detalhe').updateValueAndValidity({ emitEvent: false });
      compraNegociacaoGrupoFichaControl.get('fornecedor').updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
