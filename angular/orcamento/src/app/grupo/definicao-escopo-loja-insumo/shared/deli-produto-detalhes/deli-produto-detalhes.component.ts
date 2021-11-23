import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FiltroValor,
  isProdutoCatalogo,
  ProdutoCatalogo,
  ProdutoCatalogoVariacao,
  ProdutoCatalogoVariacaoPayload,
} from '../../models/produto-catalogo';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DeliProdutoCatalogoImagemPipe } from '../deli-produto-catalogo-imagem.pipe';
import { DefinicaoEscopoLojaInsumoService } from '../../definicao-escopo-loja-insumo.service';
import { finalize, tap } from 'rxjs/operators';
import { isEmpty } from 'lodash-es';
import { Kit } from '../../../definicao-escopo-loja-insumo-kit/models/kit';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-deli-produto-catalogo-detalhes',
  templateUrl: './deli-produto-detalhes.component.html',
  styleUrls: ['./deli-produto-detalhes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliProdutoDetalhesComponent implements OnInit {
  constructor(
    public bsModalRef: BsModalRef,
    private definicaoEscopoLojaInsumoService: DefinicaoEscopoLojaInsumoService,
    public changeDetectorRef: ChangeDetectorRef
  ) {}

  produtoCatalogo: ProdutoCatalogo | Kit;
  selecionado: boolean;
  produtoSelecionado: (produtoCatalogo: ProdutoCatalogo | Kit) => void;
  showVariacoes: boolean;
  btnText: string;
  btnDisabledFn: (produtoCatalogo: ProdutoCatalogo | Kit) => boolean;
  btnDisabled: boolean;
  hideBtn: boolean;

  noImage = DeliProdutoCatalogoImagemPipe.SEM_IMAGEM;

  private originProdutoCatalogo: ProdutoCatalogo;
  private variacoesSelected: { [key: string]: string } = {};

  trackByVariacaoGroup = trackByFactory<ProdutoCatalogoVariacao>('optionNumber');
  trackByVariacao = trackByFactory<FiltroValor>('valor');

  salvar(): void {
    if (this.produtoCatalogo.loading || this.btnDisabled) {
      return;
    }
    this.produtoSelecionado(this.produtoCatalogo);
    this.bsModalRef.hide();
  }

  selecionarVariacao(groupSelected: ProdutoCatalogoVariacao, variacaoSelected: FiltroValor, replace = true): void {
    if (
      !this.showVariacoes ||
      variacaoSelected.active ||
      groupSelected.disabled ||
      variacaoSelected.deleted ||
      !isProdutoCatalogo(this.produtoCatalogo)
    ) {
      return;
    }

    if (
      this.originProdutoCatalogo &&
      groupSelected.optionNumber < this.produtoCatalogo.maxOptionVariacoes &&
      this.produtoCatalogo.idProdutoCatalogo !== this.originProdutoCatalogo.idProdutoCatalogo
    ) {
      this.produtoCatalogo = { ...this.originProdutoCatalogo };
    }
    this.clearGreaterDeleted(groupSelected.optionNumber);
    this.produtoCatalogo = {
      ...this.produtoCatalogo,
      variacoes: this.produtoCatalogo.variacoes.map(group => {
        if (group.optionNumber === groupSelected.optionNumber) {
          group = {
            ...group,
            valoresCustom: group.valoresCustom.map(variacao => {
              return {
                ...variacao,
                active: variacaoSelected.valor === variacao.valor,
              };
            }),
          };
        }
        group = {
          ...group,
          disabled:
            group.optionNumber > groupSelected.optionNumber &&
            groupSelected.optionNumber !== group.optionNumber &&
            groupSelected.optionNumber + 1 !== group.optionNumber,
        };
        if (group.disabled || group.optionNumber > groupSelected.optionNumber) {
          group.valoresCustom = group.valoresCustom.map(variacao => ({
            ...variacao,
            active: false,
          }));
        }
        return group;
      }),
    };
    this.setVariacoesSelected();
    if (groupSelected.optionNumber < this.produtoCatalogo.maxOptionVariacoes) {
      this.checkForDeleted(groupSelected.optionNumber + 1);
    }
    if (groupSelected.optionNumber === this.produtoCatalogo.maxOptionVariacoes && replace) {
      this.replaceWithVariacao();
    }
  }

  private replaceWithVariacao(): void {
    if (!isProdutoCatalogo(this.produtoCatalogo)) {
      return;
    }
    this.originProdutoCatalogo = { ...this.produtoCatalogo };
    this.produtoCatalogo = {
      ...this.produtoCatalogo,
      loading: true,
    };
    const payload: ProdutoCatalogoVariacaoPayload[] = Object.entries(this.variacoesSelected).map(([key, value]) => {
      return {
        // "back-end + 1 problem continuacao"
        // aí precisa adicionar quando recebo pra fazer as comparações
        // depois tenho que subtrair para mandar pra ele
        // NOICE
        optionNumber: +key.replace('option', '') - 1,
        valorSelecionado: value,
      };
    });
    this.definicaoEscopoLojaInsumoService
      .getProdutoByVariacao(this.produtoCatalogo.idProduto, payload)
      .pipe(
        tap(produtoCatalogo => {
          this.produtoCatalogo = {
            ...this.produtoCatalogo,
            ...produtoCatalogo,
          };
        }),
        finalize(() => {
          this.produtoCatalogo = {
            ...this.produtoCatalogo,
            loading: false,
          };
          this.btnDisabled = this.btnDisabledFn?.(this.produtoCatalogo);
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  private clearGreaterDeleted(optionSelected: number): void {
    if (!isProdutoCatalogo(this.produtoCatalogo)) {
      return;
    }
    this.produtoCatalogo = {
      ...this.produtoCatalogo,
      variacoes: this.produtoCatalogo.variacoes.map(group => {
        if (group.optionNumber > optionSelected) {
          group = {
            ...group,
            valoresCustom: group.valoresCustom.map(v => ({
              ...v,
              deleted: false,
            })),
          };
        }
        return group;
      }),
    };
  }

  private setVariacoesSelected(): void {
    if (!isProdutoCatalogo(this.produtoCatalogo)) {
      return;
    }
    this.variacoesSelected = this.produtoCatalogo.variacoes.reduce((acc, item) => {
      const variacao = item.valoresCustom.find(v => v.active);
      if (variacao) {
        acc[`option${item.optionNumber}`] = variacao.valor;
      }
      return acc;
    }, {});
  }

  private checkForDeleted(optionSelected: number): void {
    if (!isProdutoCatalogo(this.produtoCatalogo)) {
      return;
    }
    let skus = this.produtoCatalogo.skus;
    if (optionSelected > this.produtoCatalogo.minOptionVariacoes) {
      for (let i = this.produtoCatalogo.minOptionVariacoes; i < optionSelected; i++) {
        const option = `option${i}`;
        skus = skus.filter(sku => {
          return sku[option] === this.variacoesSelected[option];
        });
      }
    }
    this.produtoCatalogo = {
      ...this.produtoCatalogo,
      variacoes: this.produtoCatalogo.variacoes.map(group => {
        if (group.optionNumber === optionSelected) {
          const option = `option${group.optionNumber}`;
          group = {
            ...group,
            valoresCustom: group.valoresCustom.map(variacao => {
              const skusFilter = skus.filter(sku => sku[option] === variacao.valor);
              return {
                ...variacao,
                deleted: !skusFilter.length || skusFilter.every(sku => sku.deleted),
              };
            }),
          };
        }
        return group;
      }),
    };
  }

  changes(): void {
    if (isProdutoCatalogo(this.produtoCatalogo) && this.showVariacoes && this.produtoCatalogo.variacoes?.length) {
      this.checkForDeleted(this.produtoCatalogo.minOptionVariacoes);
      this.checkSku();
    }
    this.btnDisabled = this.btnDisabledFn?.(this.produtoCatalogo);
    this.changeDetectorRef.markForCheck();
  }

  private checkSku(): void {
    if (!isProdutoCatalogo(this.produtoCatalogo)) {
      return;
    }
    if (this.produtoCatalogo.skus?.length && this.produtoCatalogo.idSku && isEmpty(this.variacoesSelected)) {
      const sku = this.produtoCatalogo.skus.find(s => s.idSku === (this.produtoCatalogo as ProdutoCatalogo).idSku);
      for (const group of this.produtoCatalogo.variacoes) {
        const variacao = group.valoresCustom.find(v => v.valor === sku[`option${group.optionNumber}`]);
        if (variacao) {
          this.selecionarVariacao(group, variacao, false);
        }
      }
    }
  }

  ngOnInit(): void {}
}
