import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  isProdutoCatalogo,
  ProdutoCatalogo,
} from '../../models/produto-catalogo';
import { DeliProdutoCatalogoImagemPipe } from '../deli-produto-catalogo-imagem.pipe';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeliProdutoDetalhesComponent } from '../deli-produto-detalhes/deli-produto-detalhes.component';
import {
  isKit,
  Kit,
} from '../../../definicao-escopo-loja-insumo-kit/models/kit';

@Component({
  selector: 'app-deli-produto-selecionado',
  templateUrl: './deli-produto-selecionado.component.html',
  styleUrls: ['./deli-produto-selecionado.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliProdutoSelecionadoComponent implements OnInit, OnChanges {
  constructor(private bsModalService: BsModalService) {}

  @Input() idOrcamentoGrupoItem: number;
  @Input() idFornecedor: number;
  @Input() produtoCatalogo: ProdutoCatalogo | Kit;
  @Input() showVariacoes: boolean;
  @Input() canDelete: boolean;
  @Input() btnDisabledFn: (
    produtoA: ProdutoCatalogo | Kit,
    produtoB: ProdutoCatalogo | Kit
  ) => boolean;
  @Input() hideBtn: boolean;
  @Input() btnText: string;

  idUnico: string;
  noImage = DeliProdutoCatalogoImagemPipe.SEM_IMAGEM;

  @Output() produtoSelecionado = new EventEmitter<ProdutoCatalogo | Kit>();
  @Output() variacaoSelecionada = new EventEmitter<
    [ProdutoCatalogo, ProdutoCatalogo]
  >();
  @Output() modalDetalhesOpened = new EventEmitter<ProdutoCatalogo | Kit>();
  @Output() produtoDeletado = new EventEmitter<ProdutoCatalogo | Kit>();

  private modalDetalhes: BsModalRef;

  openModal(): void {
    this.modalDetalhesOpened.emit(this.produtoCatalogo);
    this.modalDetalhes = this.bsModalService.show(
      DeliProdutoDetalhesComponent,
      {
        initialState: {
          showVariacoes: this.showVariacoes,
          produtoCatalogo: this.produtoCatalogo,
          btnText: this.btnText,
          hideBtn: this.hideBtn,
          btnDisabledFn: produtoCatalogo =>
            this.btnDisabledFn?.(this.produtoCatalogo, produtoCatalogo),
          produtoSelecionado: produtoCatalogo => {
            if (
              isProdutoCatalogo(produtoCatalogo) &&
              isProdutoCatalogo(this.produtoCatalogo) &&
              produtoCatalogo.idProdutoCatalogo !==
                this.produtoCatalogo.idProdutoCatalogo
            ) {
              this.variacaoSelecionada.emit([
                this.produtoCatalogo,
                produtoCatalogo,
              ]);
            } else if (isKit(produtoCatalogo)) {
              this.produtoSelecionado.emit(produtoCatalogo);
            }
          },
        } as Partial<DeliProdutoDetalhesComponent>,
        class: 'modal-xl',
      }
    );
  }

  ngOnInit(): void {
    this.idUnico = this.idFornecedor + '-' + this.idOrcamentoGrupoItem;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.modalDetalhes && changes.produtoCatalogo) {
      this.modalDetalhes.content.produtoCatalogo =
        changes.produtoCatalogo.currentValue;
      this.modalDetalhes.content.changes();
    }
  }
}
