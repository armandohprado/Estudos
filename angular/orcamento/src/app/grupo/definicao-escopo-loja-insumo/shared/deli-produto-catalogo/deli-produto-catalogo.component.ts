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
import { ProdutoCatalogo } from '../../models/produto-catalogo';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeliProdutoDetalhesComponent } from '../deli-produto-detalhes/deli-produto-detalhes.component';
import { DeliProdutoCatalogoImagemPipe } from '../deli-produto-catalogo-imagem.pipe';
import { Kit } from '../../../definicao-escopo-loja-insumo-kit/models/kit';

@Component({
  selector: 'app-deli-produto-catalogo',
  templateUrl: './deli-produto-catalogo.component.html',
  styleUrls: ['./deli-produto-catalogo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliProdutoCatalogoComponent implements OnInit, OnChanges {
  constructor(private bsModalService: BsModalService) {}

  @Input() produtoCatalogo: ProdutoCatalogo | Kit;
  @Input() isSelecionado: boolean;
  @Input() showCheckbox: boolean;
  @Input() showVariacoes: boolean;

  @Output() produtoSelecionado = new EventEmitter<ProdutoCatalogo | Kit>();
  @Output() modalDetalhesOpened = new EventEmitter<ProdutoCatalogo | Kit>();

  noImage = DeliProdutoCatalogoImagemPipe.SEM_IMAGEM;

  private modalDetalhes: BsModalRef;

  openModalDetalhes(): void {
    this.modalDetalhesOpened.emit(this.produtoCatalogo);
    this.modalDetalhes = this.bsModalService.show(
      DeliProdutoDetalhesComponent,
      {
        initialState: {
          produtoCatalogo: this.produtoCatalogo,
          produtoSelecionado: produtoCatalogo => {
            this.produtoSelecionado.emit(produtoCatalogo);
          },
          selecionado: this.isSelecionado,
          showVariacoes: this.showVariacoes,
        } as Partial<DeliProdutoDetalhesComponent>,
        class: 'modal-xl',
      }
    );
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.modalDetalhes && changes.produtoCatalogo) {
      this.modalDetalhes.content.produtoCatalogo =
        changes.produtoCatalogo.currentValue;
      this.modalDetalhes.content.changes();
    }
  }
}
