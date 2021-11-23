import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { maiorZero } from './maior-zero.validator';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { PavimentoGeneric } from '@aw-models/devolucao-proposta/pavimento-dp-generic';
import { Item, StatusItem } from '@aw-models/devolucao-proposta/item';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { ActivatedRoute } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { bloqueiaServico } from '../../../../../../../../grupo/definicao-escopo/shared/bloqueia-servico.pipe';
import { bloqueiaProduto } from '../../../../../../../../grupo/definicao-escopo/shared/bloqueia-produto.pipe';
import { catchAndThrow, refreshMap } from '@aw-utils/rxjs/operators';
import { AtualizarItem } from '@aw-models/devolucao-proposta/atualizar-item';

@Component({
  selector: 'app-item-detalhes',
  templateUrl: './item-detalhes.component.html',
  styleUrls: ['./item-detalhes.component.scss'],
})
export class ItemDetalhesComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  @Input() item: Item;
  @Input() pavimento: PavimentoGeneric;
  @Input() last: boolean;
  @Input() omisso: boolean;

  formSubfornecedores: FormGroup;

  constructor(
    public devolucaoPropostaService: DevolucaoPropostaService,
    private dataDevolucaoProposta: DataDevolucaoPropostaService,
    private formBuilder: FormBuilder,
    private awDialogService: AwDialogService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setarFormularioSubfornecedor();
  }

  initSub(): void {
    const withDistinct = (name: keyof StatusItem) =>
      this.formSubfornecedores
        .get(name)
        .valueChanges.pipe(
          takeUntil(this._destroy$),
          filter(() => {
            return this.formSubfornecedores.valid;
          })
        )
        .subscribe(o => {
          this.salvarItem(name, {
            ...this.formSubfornecedores.value,
            [name]: o,
          });
        });
    for (const key in this.formSubfornecedores.controls) {
      if (!/^(idPropostaItem|idPropostaItemStatus|idProposta)$/.test(key)) {
        withDistinct(key as keyof StatusItem);
      }
    }
  }
  setLoader(ent: keyof StatusItem, loading: AwInputStatus): void {
    const status = { ...this.item.status, [ent]: loading };
    this.devolucaoPropostaService.atualizarItem(this.pavimento, this.item, {
      status,
    });
  }

  setarFormularioSubfornecedor(): void {
    const supply = this.activatedRoute.snapshot.data[RouteParamEnum.supply];
    const { retornoProposta, enviadoAprovacaoFornecedor, classificacao } =
      this.devolucaoPropostaService.cabecalhoProposta;
    this.formSubfornecedores = this.formBuilder.group(
      {
        idFornecedorSubServico: this.item.atributos?.idFornecedorSubServico ?? null,
        idFornecedorSubProduto: this.item.atributos?.idFornecedorSubProduto ?? null,
        valorTotal: this.item.valorTotal,
        quantidade: [{ value: this.item.quantidade, disabled: true }, [Validators.maxLength(100), maiorZero]],
        observacao: [
          {
            value: this.item.atributos?.observacao,
            disabled: retornoProposta || enviadoAprovacaoFornecedor || supply,
          },
        ],
        idPropostaItem: this.item.idPropostaItem,
        idPropostaItemStatus: this.item.idPropostaItemStatus || 1,
        idProposta: this.item.idProposta,
        valorUnitarioProduto: [
          {
            value: this.item.valorUnitarioProduto ?? 0,
            disabled: bloqueiaProduto(classificacao) || retornoProposta || enviadoAprovacaoFornecedor || supply,
          },
        ],
        valorUnitarioServico: [
          {
            value: this.item.valorUnitarioServico ?? 0,
            disabled: bloqueiaServico(classificacao) || retornoProposta || enviadoAprovacaoFornecedor || supply,
          },
        ],
        descontoUnitarioProduto: [
          {
            value: this.item.descontoUnitarioProduto ?? 0,
            disabled: bloqueiaProduto(classificacao) || (retornoProposta && !supply) || enviadoAprovacaoFornecedor,
          },
        ],
        descontoUnitarioServico: [
          {
            value: this.item?.descontoUnitarioServico ?? 0,
            disabled: bloqueiaServico(classificacao) || (retornoProposta && !supply) || enviadoAprovacaoFornecedor,
          },
        ],
        descricao: this.item.descricao,
        unidadeMedida: [this.item.unidadeMedida || null],
        idUnidade: [this.item.idUnidade || null, [Validators.required]],
      },
      { updateOn: 'blur' }
    );
    setTimeout(() => {
      this.initSub();
    });
  }

  naoSalvarItem(): void {
    this.devolucaoPropostaService.atualizarItem(this.pavimento, this.item, {
      loader: true,
    });
    this.dataDevolucaoProposta
      .atualizarStatusPavimento(3, this.item.idPropostaItem)
      .pipe(
        switchMap(() => {
          const cabecalho = this.dataDevolucaoProposta.preencherCabecalho(
            this.devolucaoPropostaService.cabecalhoProposta.idProposta
          );
          const proposta = this.dataDevolucaoProposta.atualizarProposta(
            this.devolucaoPropostaService.cabecalhoProposta.idProposta,
            this.pavimento,
            this.item
          );
          return forkJoin([cabecalho, proposta]);
        }),
        finalize(() => {
          this.devolucaoPropostaService.atualizarItem(this.pavimento, this.item, { loader: false });
        })
      )
      .subscribe();
  }

  salvarItem(nameInput: keyof StatusItem, value: AtualizarItem): void {
    this.setLoader(nameInput, 'loading');
    const cabecalho = this.dataDevolucaoProposta.preencherCabecalho(this.pavimento.idProposta);
    const atualizarProposta = newItem =>
      this.dataDevolucaoProposta.atualizarProposta(this.pavimento.idProposta, this.pavimento, newItem);
    this.dataDevolucaoProposta
      .atualizarPavimento({ ...this.item, ...value }, this.item.idPropostaItem)
      .pipe(
        refreshMap(envio => {
          this.item.atributos.observacao = envio.comentarioPropostaItem;
          const newItem = {
            ...this.item,
            ...envio,
          };
          return forkJoin([cabecalho, atualizarProposta(newItem)]);
        }),
        finalize(() => {
          this.setLoader(nameInput, 'completed');
        }),
        catchAndThrow(() => {
          this.awDialogService.error('Erro ao alterar dados!', 'Falha na api');
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
