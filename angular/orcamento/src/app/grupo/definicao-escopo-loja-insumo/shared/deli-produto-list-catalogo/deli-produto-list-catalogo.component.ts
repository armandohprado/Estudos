import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { FiltroProdutoCatalogo, ProdutoCatalogo } from '../../models/produto-catalogo';
import { Kit } from '../../../definicao-escopo-loja-insumo-kit/models/kit';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-deli-produto-list-catalogo',
  templateUrl: './deli-produto-list-catalogo.component.html',
  styleUrls: ['./deli-produto-list-catalogo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliProdutoListCatalogoComponent implements OnInit, OnDestroy {
  constructor() {}

  @ViewChild('cardProdutos') cardProdutosRef: ElementRef<HTMLDivElement>;

  private _destroy$ = new Subject<void>();

  currentPage = 1;

  @Input() catalogo: Array<ProdutoCatalogo | Kit>;
  @Input() filtrosAtivos: FiltroProdutoCatalogo[];
  @Input() term: string;

  @Input() showCheckbox: boolean;
  @Input() showVariacoes: boolean;

  @Output() modalDetalhesOpened = new EventEmitter<ProdutoCatalogo | Kit>();
  @Output() filtroChanged = new EventEmitter<FiltroProdutoCatalogo>();
  @Output() produtoSelecionado = new EventEmitter<ProdutoCatalogo | Kit>();

  trackByProduto = trackByFactory<ProdutoCatalogo | Kit>('idProdutoCatalogo' as any, 'idKit' as any);
  trackByFiltro = trackByFactory<FiltroProdutoCatalogo>();

  inactivateFilter(filtro: FiltroProdutoCatalogo): void {
    this.filtroChanged.emit(filtro);
  }

  onPageChange(): void {
    this.cardProdutosRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
