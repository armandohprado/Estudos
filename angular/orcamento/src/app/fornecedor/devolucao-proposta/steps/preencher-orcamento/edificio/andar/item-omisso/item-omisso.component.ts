import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { maiorZero } from '../lista-item/item-detalhes/maior-zero.validator';
import { PavimentoGeneric } from '@aw-models/devolucao-proposta/pavimento-dp-generic';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { finalize, skipWhile, takeUntil, tap } from 'rxjs/operators';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { Subject } from 'rxjs';
import { Item } from '@aw-models/devolucao-proposta/item';
import { bloqueiaServico } from '../../../../../../../grupo/definicao-escopo/shared/bloqueia-servico.pipe';
import { bloqueiaProduto } from '../../../../../../../grupo/definicao-escopo/shared/bloqueia-produto.pipe';

@Component({
  selector: 'app-item-omisso',
  templateUrl: './item-omisso.component.html',
  styleUrls: ['./item-omisso.component.scss'],
})
export class ItemOmissoComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  omisso: Item;
  @Input() pavimento: PavimentoGeneric;
  @Input() itemOmisso: boolean;
  @Input() quantitativo;
  formOmisso: FormGroup;
  loadingOmisso = false;
  ngOnInit(): void {
    this.setarFormOmisso();
    this.omisso = { ...this.omisso };
  }
  constructor(
    private formBuilder: FormBuilder,
    public devolucaoProposta: DevolucaoPropostaService,
    public dataDevolucaoProposta: DataDevolucaoPropostaService
  ) {}
  setarFormOmisso(): void {
    this.formOmisso = this.formBuilder.group(
      {
        idFornecedorSubServico: 0,
        valorTotal: 0,
        quantidade: [{ value: '0', disabled: true }, [Validators.maxLength(100), maiorZero]],
        observacao: '',
        idPropostaItem: 0,
        idPropostaItemStatus: 1,
        idFornecedorSubProduto: 0,
        idProposta: this.pavimento.idProposta,
        valorUnitarioProduto: [
          {
            value: 0,
            disabled: bloqueiaProduto(this.devolucaoProposta.classificacao),
          },
        ],
        valorUnitarioServico: [
          {
            value: 0,
            disabled: bloqueiaServico(this.devolucaoProposta.classificacao),
          },
        ],
        descontoUnitarioProduto: [
          {
            value: 0,
            disabled: bloqueiaProduto(this.devolucaoProposta.classificacao),
          },
        ],
        descontoUnitarioServico: [
          {
            value: 0,
            disabled: bloqueiaServico(this.devolucaoProposta.classificacao),
          },
        ],
        descricao: ['', [Validators.required]],
        unidadeMedida: '',
        idUnidade: [null, [Validators.required]],
      },
      { updateOn: 'blur' }
    );
    setTimeout(() => {
      this.initSub();
    });
  }

  initSub(): void {
    this.formOmisso.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        skipWhile(() => this.formOmisso.invalid),
        tap(() => {
          this.salvarItem();
        })
      )
      .subscribe();
  }

  salvarItem(): void {
    this.loadingOmisso = true;
    this.dataDevolucaoProposta
      .adicionarItemOmisso(
        { ...this.formOmisso.value, ...this.quantitativo },
        this.devolucaoProposta.cabecalhoProposta.idProposta
      )
      .subscribe(envio => {
        this.dataDevolucaoProposta.preencherCabecalho(this.pavimento.idProposta).subscribe();
        this.omisso = {
          ...this.omisso,
          classificacao: this.devolucaoProposta.classificacao,
          ...envio,
          ...this.pavimento,
        };
        this.dataDevolucaoProposta
          .atualizarProposta(this.pavimento.idProposta, this.pavimento, this.omisso)
          .pipe(
            finalize(() => {
              this.loadingOmisso = false;
            })
          )
          .subscribe();
      });
  }
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
