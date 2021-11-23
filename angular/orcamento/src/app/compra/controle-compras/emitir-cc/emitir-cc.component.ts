import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CcGrupoQuery } from '../state/grupos/cc-grupo.query';
import { Observable, Subject } from 'rxjs';
import { CnGrupo, CnTipoGrupoEnum } from '../../models/cn-grupo';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { EmpresaFaturamento } from '@aw-models/empresa-faturamento';
import { ContatoAlt } from '../../../models';
import { CnEmitirCcPayload, CnEmitirCcPayloadRevenda, CnEmitirCcPayloadSemMapa } from '../../models/cn-emitir-cc';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';
import { distinctUntilChanged, finalize, pluck, takeUntil } from 'rxjs/operators';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { CnConfirmacaoCompraFornecedor } from '../../models/cn-confirmacao-compra';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { filterNilValue } from '@datorama/akita';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { EmitirCcTipoEnum } from './emitir-cc-tipo.enum';
import { AwRouterService } from '@aw-services/core/aw-router.service';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';
import { cnCreateValidatorDataFluxoSD } from '../util';

@Component({
  selector: 'app-emitir-cc',
  templateUrl: './emitir-cc.component.html',
  styleUrls: ['./emitir-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmitirCcComponent implements OnInit, OnDestroy {
  constructor(
    private ccGrupoQuery: CcGrupoQuery,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ccGrupoService: CcGrupoService,
    private awDialogService: AwDialogService,
    private awRouterService: AwRouterService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private readonly _destroy$ = new Subject<void>();

  readonly idCompraNegociacaoGrupo = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
  readonly idCompraNegociacaoGrupoMapaFornecedor = +this.activatedRoute.snapshot.paramMap.get(
    RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor
  );
  readonly idProjeto = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjeto);
  readonly tipo = this.activatedRoute.snapshot.data[RouteDataEnum.tipo] as EmitirCcTipoEnum;
  readonly grupo$ = this.ccGrupoQuery.selectEntity(this.idCompraNegociacaoGrupo).pipe(filterNilValue());
  readonly contatos$: Observable<ContatoAlt[]> = this.grupo$.pipe(pluck('confirmacaoCompraContatos'));
  readonly cnTipoGrupoEnum = CnTipoGrupoEnum;

  readonly form = new FormGroup({
    empresaFaturamento: new FormControl(null, [Validators.required]),
    contatoFornecedor: new FormControl(this.grupo.emitirCc.contato, [Validators.required]),
    valorMiscellaneous: new FormControl(this._getValorMiscellaneousInitial(), [this._validatorValores.bind(this)]),
    valorSaldoContingencia: new FormControl(this._getValorSaldoContingenciaInitial(), {
      validators: [this._validatorValores.bind(this)],
      updateOn: 'blur',
    }),
    dataFluxoSD: new FormControl(null, [cnCreateValidatorDataFluxoSD(this.grupo)]),
  });

  readonly emitirCcTipoEnum = EmitirCcTipoEnum;

  saving = false;

  get valorMiscellaneousControl(): FormControl {
    return this.form.get('valorMiscellaneous') as FormControl;
  }

  get valorSaldoContingenciaControl(): FormControl {
    return this.form.get('valorSaldoContingencia') as FormControl;
  }

  get grupo(): CnGrupo {
    return this.ccGrupoQuery.getEntity(this.idCompraNegociacaoGrupo);
  }

  private _getFormValue(): {
    empresaFaturamento: EmpresaFaturamento;
    contatoFornecedor: ContatoAlt;
    valorMiscellaneous: number;
    valorSaldoContingencia: number;
    dataFluxoSD: Date;
  } {
    return this.form.value;
  }

  private _getSaldoDisponivel(): number {
    const {
      emitirCc: { valorSaldoComTransferencias, valorTotal },
    } = this.grupo;
    return Math.max(arredondamento(valorSaldoComTransferencias - valorTotal, 2), 0);
  }

  private _getValorSaldoContingenciaInitial(): number {
    let valorSaldoContingencia: number | null = null;
    if (this._isSemMapa()) {
      const { tipo } = this.grupo;
      valorSaldoContingencia = tipo === CnTipoGrupoEnum.Direto ? 0 : this._getSaldoDisponivel();
    }
    return valorSaldoContingencia;
  }

  private _getValorMiscellaneousInitial(): number {
    let valorMiscellaneous: number | null = null;
    if (this._isSemMapa()) {
      const { tipo } = this.grupo;
      valorMiscellaneous = tipo === CnTipoGrupoEnum.Direto ? this._getSaldoDisponivel() : 0;
    }
    return valorMiscellaneous;
  }

  private _isSemMapa(): boolean {
    return this.tipo === EmitirCcTipoEnum.SemMapa;
  }

  private _validatorValores(control: AbstractControl): ValidationErrors | null {
    return this._isSemMapa() && this.grupo.tipo === CnTipoGrupoEnum.Direto ? Validators.required(control) : null;
  }

  private _cnEmitirCcPayload(idCompraNegociacaoGrupoMapaFornecedor: number | null = null): CnEmitirCcPayload {
    const {
      idGrupo,
      planoCompraQuestoes,
      confirmacaoCompra: {
        cliente: { entregaProdutosServicos, entregaDocumentos, numeroInterno },
        dadosGrupo: {
          classificacao: { idConfirmacaoCompraClassificacao },
          condicaoPagamento,
          prazoEntregaObra,
          prazoExecucaoObra,
        },
      },
    } = this.grupo;
    const { contatoFornecedor, empresaFaturamento, dataFluxoSD } = this._getFormValue();
    return {
      bairroDocumento: entregaDocumentos.bairro,
      bairroEntrega: entregaProdutosServicos.bairro,
      cepDocumento: entregaDocumentos.cep,
      cepEntrega: entregaProdutosServicos.cep,
      complementoDocumento: entregaDocumentos.complemento,
      complementoEntrega: entregaProdutosServicos.complemento,
      condicaoPagamento,
      enderecoDocumento: entregaDocumentos.endereco,
      enderecoEntrega: entregaProdutosServicos.endereco,
      idCidadeDocumento: entregaDocumentos.cidade.idCidade,
      idCidadeEntrega: entregaProdutosServicos.cidade.idCidade,
      idCompraNegociacaoGrupo: this.idCompraNegociacaoGrupo,
      idCompraNegociacaoGrupoMapaFornecedor,
      idConfirmacaoCompraClassificacao,
      idEmpresaFaturamento: empresaFaturamento.idFaturamentoCobranca,
      idEstadoDocumento: entregaDocumentos.uf.idEstado,
      idEstadoEntrega: entregaProdutosServicos.uf.idEstado,
      idFornecedorContato: contatoFornecedor.idContato,
      idPaisDocumento: entregaDocumentos.pais.idPais,
      idPaisEntrega: entregaProdutosServicos.pais.idPais,
      numeroInternoCliente: numeroInterno,
      observacao: entregaProdutosServicos.observacao,
      prazoEntregaObra,
      prazoExecucaoObra,
      idGrupo,
      idProjeto: this.idProjeto,
      planoCompraQuestoes: (planoCompraQuestoes ?? []).map(({ idPlanoCompraQuestao, resposta }) => ({
        idPlanoCompraQuestao,
        resposta,
      })),
      dataFluxoSD,
    };
  }

  private _getIndexQueryParam(): number {
    return +(this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.index) ?? -1);
  }

  private _emitirCcRevenda(): Observable<CnConfirmacaoCompraFornecedor> {
    const index = this._getIndexQueryParam();
    const revenda = this.grupo.confirmacaoCompraRevenda[index];
    const payload: CnEmitirCcPayloadRevenda = {
      ...this._cnEmitirCcPayload(),
      valorMargemRevenda: revenda.valorTotalNegociado,
      idConfirmacaoCompraClassificacao:
        this.grupo.confirmacaoCompra.dadosGrupo.classificacaoRevenda.idConfirmacaoCompraClassificacao,
    };
    return this.ccGrupoService.emitirCcRevenda(payload);
  }

  private _emitirCcMisc(): Observable<CnConfirmacaoCompraFornecedor> {
    const payload = this._cnEmitirCcPayload();
    const index = this._getIndexQueryParam();
    const misc = this.ccGrupoQuery.getMisc(this.idCompraNegociacaoGrupo, index);
    const property = misc.propertyValor;
    const other = misc.propertyValor === 'valorSaldoContingencia' ? 'valorMargemRevenda' : 'valorSaldoContingencia';
    payload[property] = misc.valorTotalSelecionado;
    payload[other] = 0;
    return this.ccGrupoService.emitirCcMiscellaneous(payload);
  }

  private _emitirCcFornecedor(
    idCompraNegociacaoGrupoMapaFornecedor: number
  ): Observable<CnConfirmacaoCompraFornecedor> {
    return this.ccGrupoService.emitirCc(this._cnEmitirCcPayload(idCompraNegociacaoGrupoMapaFornecedor));
  }

  private _emitirCcSemMapa(): Observable<CnConfirmacaoCompraFornecedor> {
    const { valorMiscellaneous, valorSaldoContingencia } = this._getFormValue();
    const payload: CnEmitirCcPayloadSemMapa = {
      ...this._cnEmitirCcPayload(0),
      valorMiscellaneous,
      valorSaldoContingencia,
    };
    return this.ccGrupoService.emitirCcSemMapa(payload);
  }

  voltar($event?: MouseEvent): boolean | void {
    const commands = ['../../../../../'];
    const extras: NavigationExtras = {
      relativeTo: this.activatedRoute,
      queryParams: {
        [RouteParamEnum.idCompraNegociacaoGrupo]: this.idCompraNegociacaoGrupo,
      },
    };
    if ($event) {
      return this.awRouterService.handleNavigate($event, commands, extras);
    } else {
      this.router.navigate(commands, extras).then();
    }
  }

  emitirCc(): void {
    if (this.form.invalid) {
      return;
    }
    this.saving = true;
    let http$: Observable<any>;
    switch (this.tipo) {
      case EmitirCcTipoEnum.Miscellaneous:
        http$ = this._emitirCcMisc();
        break;
      case EmitirCcTipoEnum.SemMapa:
        http$ = this._emitirCcSemMapa();
        break;
      case EmitirCcTipoEnum.GrupoTaxa:
        http$ = this._emitirCcFornecedor(0);
        break;
      case EmitirCcTipoEnum.Revenda:
        http$ = this._emitirCcRevenda();
        break;
      default:
        http$ = this._emitirCcFornecedor(this.idCompraNegociacaoGrupoMapaFornecedor);
    }
    http$
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetectorRef.markForCheck();
        }),
        catchAndThrow(response => {
          this.awDialogService.error(
            'Erro ao tentar emitir a CC',
            response?.error?.mensagem ?? 'Favor tentar novamente mais tarde'
          );
        })
      )
      .subscribe(() => {
        this.awDialogService.success(
          'CC emitida com sucesso',
          'A CC foi enviada com sucesso, aguarde o retorno da Central',
          {
            bsModalOptions: { ignoreBackdropClick: true },
            secondaryBtn: null,
            primaryBtn: {
              title: 'Voltar para Controle de Compra',
              action: bsModalRef => {
                this.voltar();
                bsModalRef.hide();
              },
            },
          }
        );
      });
  }

  ngOnInit(): void {
    const valorDisponivel = this._getSaldoDisponivel();
    if (this._isSemMapa() && valorDisponivel > 0) {
      this.valorSaldoContingenciaControl.valueChanges
        .pipe(takeUntil(this._destroy$), distinctUntilChanged())
        .subscribe(valorSaldoContingencia => {
          this.valorMiscellaneousControl.setValue(
            Math.max(arredondamento(valorDisponivel - valorSaldoContingencia, 2), 0)
          );
        });
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
