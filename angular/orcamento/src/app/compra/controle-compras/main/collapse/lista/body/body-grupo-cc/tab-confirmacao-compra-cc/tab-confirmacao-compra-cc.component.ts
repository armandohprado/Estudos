import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CurrencyMaskConfig } from 'ngx-currency';
import { CnConfirmacaoCompraModo, CnGrupo, CnTipoGrupoEnum } from '../../../../../../../models/cn-grupo';
import { ListaEmitirCcItemChangeEvent, TipoListaEmitirCcEnum } from './lista-emitir-cc/lista-emitir-cc.component';
import { ControleComprasQuery } from '../../../../../../state/controle-compras/controle-compras.query';
import { ControleComprasService } from '../../../../../../state/controle-compras/controle-compras.service';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { CcGrupoService } from '../../../../../../state/grupos/cc-grupo.service';
import { Pais } from '@aw-models/enderecos/pais';
import { Estado } from '@aw-models/enderecos/estado';
import { Cidade } from '@aw-models/enderecos/cidade';
import { CnConfirmacaoCompra, CnConfirmacaoCompraEndereco } from '../../../../../../../models/cn-confirmacao-compra';
import { AwSelectOption } from '@aw-components/aw-select/aw-select.type';
import { CnClassificacao } from '../../../../../../../models/cn-classificacao';
import { StateComponent } from '@aw-shared/components/common/state-component';
import { filterNilValue } from '@datorama/akita';
import { ActivatedRoute } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { isNil } from 'lodash-es';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { EnderecosService } from '@aw-services/enderecos/enderecos.service';
import { concat } from 'rxjs';
import { CcGrupoQuery } from '../../../../../../state/grupos/cc-grupo.query';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

interface TabConfirmacaoCompraCcComponentState {
  loadingDadosGrupo: boolean;
  loadingCliente: boolean;
  loadingFornecedores: boolean;
  loadingMisc: boolean;
  loadingClassificacoes: boolean;
  grupo?: CnGrupo;
  loadingFichas: boolean;
  loadingRevenda: boolean;
}

const tabConfirmacaoCompraCcComponentStateInitial: TabConfirmacaoCompraCcComponentState = {
  loadingClassificacoes: false,
  loadingCliente: true,
  loadingDadosGrupo: false,
  loadingFornecedores: false,
  loadingMisc: false,
  loadingFichas: false,
  loadingRevenda: false,
};

@Component({
  selector: 'app-tab-confirmacao-compra-cc',
  templateUrl: './tab-confirmacao-compra-cc.component.html',
  styleUrls: ['./tab-confirmacao-compra-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabConfirmacaoCompraCcComponent
  extends StateComponent<TabConfirmacaoCompraCcComponentState>
  implements OnInit
{
  constructor(
    public controleComprasQuery: ControleComprasQuery,
    private controleComprasService: ControleComprasService,
    private ccGruposService: CcGrupoService,
    private activatedRoute: ActivatedRoute,
    private ccGrupoQuery: CcGrupoQuery,
    private projetoService: ProjetoService
  ) {
    super(tabConfirmacaoCompraCcComponentStateInitial, { inputs: ['grupo'] });
  }

  readonly idProjeto = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjeto);
  readonly cnConfirmacaoCompraModo = CnConfirmacaoCompraModo;
  readonly cnTipoGrupoEnum = CnTipoGrupoEnum;
  readonly projeto$ = this.projetoService.projeto$;

  @Input() grupo: CnGrupo;

  readonly grupo$ = this.selectState('grupo').pipe(filterNilValue());

  readonly loadingState$ = this.selectState([
    'loadingDadosGrupo',
    'loadingCliente',
    'loadingFornecedores',
    'loadingMisc',
    'loadingClassificacoes',
    'loadingFichas',
    'loadingRevenda',
  ]);

  readonly tipoListaEmitirCcEnum = TipoListaEmitirCcEnum;
  readonly currencyOptions: Partial<CurrencyMaskConfig> = { allowNegative: false, precision: 0 };

  readonly form = new FormGroup(
    {
      dadosGrupo: new FormGroup({
        classificacao: new FormControl(null, [this._classificacaoRequiredValidator()]),
        classificacaoRevenda: new FormControl(null, [
          this._classificacaoRequiredValidator(CnConfirmacaoCompraModo.Revenda),
        ]),
        prazoEntregaObra: new FormControl(null, [Validators.required]),
        prazoExecucaoObra: new FormControl(null, [Validators.required]),
        condicaoPagamento: new FormControl(null, [Validators.required]),
      }),
      cliente: new FormGroup({
        numeroInterno: new FormControl(),
        entregaDocumentos: this._createEnderecoFormGroup(),
        entregaProdutosServicos: this._createEnderecoFormGroup(true),
      }),
    },
    { updateOn: 'blur' }
  );

  readonly itemDisabled = (item: AwSelectOption<CnClassificacao>) => !item.data.ativo;

  private _classificacaoRequiredValidator(modo?: CnConfirmacaoCompraModo): ValidatorFn {
    return control =>
      !modo || this.ccGrupoQuery.getEntity(this.grupo?.idCompraNegociacaoGrupo ?? -1)?.confirmacaoCompraModo === modo
        ? Validators.required(control)
        : null;
  }

  private _patchForm(confirmacao: CnConfirmacaoCompra): void {
    if (!confirmacao) return;
    this.form.patchValue(confirmacao);
    if (confirmacao?.cliente?.entregaDocumentos?.pais) {
      const { pais, uf, cidade } = confirmacao.cliente.entregaDocumentos;
      this._patchEndereco('entregaDocumentos', pais, uf, cidade);
    }
    if (confirmacao?.cliente?.entregaProdutosServicos?.pais) {
      const { pais, uf, cidade } = confirmacao.cliente.entregaProdutosServicos;
      this._patchEndereco('entregaProdutosServicos', pais, uf, cidade);
    }
    this.form.enable();
  }

  private _patchEndereco(formName: string, pais?: Pais, estado?: Estado, cidade?: Cidade): void {
    const clienteControl = this.form.get(['cliente', formName]);
    if (pais) {
      clienteControl.get('pais').setValue(pais);
      if (estado) {
        clienteControl.get('uf').setValue(estado);
        if (cidade) {
          clienteControl.get('cidade').setValue(cidade);
        }
      }
    }
  }

  private _createEnderecoFormGroup(observacao = false): FormGroup {
    const formGroup = new FormGroup({
      endereco: new FormControl(null, [Validators.required]),
      complemento: new FormControl(),
      bairro: new FormControl(null, [Validators.required]),
      cep: new FormControl(null, [Validators.required]),
      cidade: new FormControl({ value: null, disabled: true }, [Validators.required]),
      uf: new FormControl({ value: null, disabled: true }, [Validators.required]),
      pais: new FormControl(null, [Validators.required]),
    });
    if (observacao) {
      formGroup.addControl('observacao', new FormControl());
    }
    return formGroup;
  }

  private _initDev(): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const preencherFormConfirmacaoCompraParam = this.activatedRoute.snapshot.queryParamMap.get(
        'preencherFormConfirmacaoCompra'
      );
      if (!isNil(preencherFormConfirmacaoCompraParam) && coerceBooleanProperty(preencherFormConfirmacaoCompraParam)) {
        const { cidade, estado, pais } = EnderecosService.enderecoAw;
        const endereco: CnConfirmacaoCompraEndereco = {
          endereco: 'PRAÇA JOÃO DURAN ALONSO, 34',
          complemento: '13 ANDAR',
          cep: '04571070',
          bairro: 'Cidade Monções',
          uf: estado,
          pais,
          cidade,
          observacao: '1',
        };
        this.form.patchValue({
          cliente: {
            numeroInterno: '1',
            entregaDocumentos: endereco,
            entregaProdutosServicos: endereco,
          },
          dadosGrupo: {
            prazoExecucaoObra: 1,
            condicaoPagamento: '1',
            prazoEntregaObra: 1,
          },
        });
      }
    }
  }

  onConfirmacaoCompraModoChange(): void {
    this.ccGruposService.updateGrupoCallback(this.grupo.idCompraNegociacaoGrupo, grupo => ({
      ...grupo,
      confirmacaoCompraModo:
        grupo.confirmacaoCompraModo === CnConfirmacaoCompraModo.Fornecedor
          ? grupo.tipo === CnTipoGrupoEnum.Direto
            ? CnConfirmacaoCompraModo.Miscellaneous
            : CnConfirmacaoCompraModo.Revenda
          : CnConfirmacaoCompraModo.Fornecedor,
    }));
    const dadosGrupoControl = this.form.get('dadosGrupo');
    dadosGrupoControl.get('classificacao').updateValueAndValidity();
    dadosGrupoControl.get('classificacaoRevenda').updateValueAndValidity();
  }

  onRevendaItemChange($event: ListaEmitirCcItemChangeEvent): void {
    this.ccGruposService.updateConfirmacaoCompraRevenda(this.grupo.idCompraNegociacaoGrupo, $event.index, $event.item);
  }

  ngOnInit(): void {
    const partialLoading: Partial<TabConfirmacaoCompraCcComponentState> = {
      loadingDadosGrupo: true,
      loadingCliente: true,
      loadingClassificacoes: true,
      loadingFornecedores: true,
      loadingFichas: true,
    };
    if (this.grupo.tipo === CnTipoGrupoEnum.Refaturado) {
      partialLoading.loadingRevenda = true;
    } else {
      partialLoading.loadingMisc = true;
    }
    this.updateState(partialLoading);

    concat(
      this.ccGruposService.getConfirmacaoCompras(this.grupo.idCompraNegociacaoGrupo),
      this.ccGruposService.getClassificacoes(this.grupo.idCompraNegociacaoGrupo),
      this.ccGruposService.getClassificacoesRevenda(this.grupo.idCompraNegociacaoGrupo)
    )
      .pipe(
        finalize(() => {
          this.updateState({ loadingClassificacoes: false, loadingCliente: false, loadingDadosGrupo: false });
          this._initDev();
        })
      )
      .subscribe();
    this.ccGruposService
      .getFornecedoresConfirmacaoCompra(
        this.grupo.idCompraNegociacaoGrupo,
        this.grupo.grupoTaxa,
        this.grupo.permitidoEmitirCcSemMapa
      )
      .pipe(
        finalize(() => {
          this.updateState({ loadingFornecedores: false });
        })
      )
      .subscribe();
    if (this.grupo.tipo === CnTipoGrupoEnum.Refaturado) {
      this.ccGruposService
        .getRevendaConfirmacaoCompra(this.grupo.idCompraNegociacaoGrupo)
        .pipe(
          finalize(() => {
            this.updateState({ loadingRevenda: false });
          })
        )
        .subscribe();
    } else {
      this.ccGruposService
        .getMiscellaneousConfirmacaoCompra(this.grupo.idCompraNegociacaoGrupo)
        .pipe(
          finalize(() => {
            this.updateState({ loadingMisc: false });
          })
        )
        .subscribe();
    }

    this.ccGruposService
      .getFichas(this.grupo.idCompraNegociacaoGrupo)
      .pipe(
        finalize(() => {
          this.updateState({ loadingFichas: false });
        })
      )
      .subscribe();
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(confirmacaoCompra => {
      this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { confirmacaoCompra });
    });
    this.grupo$
      .pipe(
        switchMap(grupo => this.ccGruposService.selectUpdateTabConfirmacaoCompraCCForm(grupo.idCompraNegociacaoGrupo)),
        takeUntil(this.destroy$)
      )
      .subscribe(confirmacao => {
        this._patchForm(confirmacao);
      });
  }
}
