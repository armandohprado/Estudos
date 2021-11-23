import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProdutoCatalogo } from '../../models/produto-catalogo';
import { groupBy } from 'lodash-es';
import { Kit } from '../../../definicao-escopo-loja-insumo-kit/models/kit';
import { trackByFactory } from '@aw-utils/track-by';

export interface ProdutosGrouped {
  idFornecedor: number;
  nomeFornecedor: string;
  produtos: Array<ProdutoCatalogo | Kit>;
}

@Component({
  selector: 'app-deli-produto-list-selecionado',
  templateUrl: './deli-produto-list-selecionado.component.html',
  styleUrls: ['./deli-produto-list-selecionado.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliProdutoListSelecionadoComponent implements OnInit {
  constructor() {}

  @Input()
  get produtos(): Array<ProdutoCatalogo | Kit> {
    return this._produtos;
  }
  set produtos(produtos: Array<ProdutoCatalogo | Kit>) {
    this._produtos = produtos;
    this.produtosGrouped = Object.entries(groupBy(produtos, 'idFornecedor')).map(([key, value]) => {
      const idFornecedor = +key;
      return {
        idFornecedor,
        nomeFornecedor: value[0].nomeFornecedor,
        produtos: value,
      };
    });
  }
  private _produtos: Array<ProdutoCatalogo | Kit>;

  produtosGrouped: ProdutosGrouped[] = [];

  @Input() showVariacoes: boolean;
  @Input() canDelete: boolean;
  @Input() loading: boolean;
  @Input() idOrcamentoGrupoItem: number;
  @Input() orderBy: string;
  @Input() btnDisabledFn: (produtoA: ProdutoCatalogo | Kit, produtoB: ProdutoCatalogo | Kit) => boolean;
  @Input() hideBtn: boolean;
  @Input() btnText: string;
  @Input() labelSelecionados: string;

  @Output() produtoSelecionado = new EventEmitter<ProdutoCatalogo | Kit>();
  @Output() variacaoSelecionada = new EventEmitter<[ProdutoCatalogo, ProdutoCatalogo]>();
  @Output() produtoDeletado = new EventEmitter<ProdutoCatalogo | Kit>();
  @Output() modalDetalhesOpened = new EventEmitter<ProdutoCatalogo | Kit>();

  trackByProdutoCatalogoGroup = trackByFactory<ProdutosGrouped>('idFornecedor');
  trackByProdutoCatalogo = trackByFactory<ProdutoCatalogo | Kit>('idProdutoCatalogo' as any, 'idKit' as any);

  ngOnInit(): void {}
}
