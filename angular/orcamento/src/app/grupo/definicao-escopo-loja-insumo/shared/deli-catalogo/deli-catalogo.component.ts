import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FiltroProdutoCatalogo,
  ProdutoCatalogo,
} from '../../models/produto-catalogo';
import { Kit } from '../../../definicao-escopo-loja-insumo-kit/models/kit';

@Component({
  selector: 'app-deli-catalogo',
  templateUrl: './deli-catalogo.component.html',
  styleUrls: ['./deli-catalogo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliCatalogoComponent implements OnInit {
  constructor() {}

  @Input() catalogo: Array<ProdutoCatalogo | Kit>;
  @Input() showCheckbox: boolean;
  @Input() showVariacoes: boolean;
  @Input() filtrosAtivos: FiltroProdutoCatalogo[];
  @Input() term: string;

  @Output() modalDetalhesOpened = new EventEmitter<ProdutoCatalogo | Kit>();
  @Output() produtoSelecionado = new EventEmitter<ProdutoCatalogo | Kit>();
  @Output() filtroChanged = new EventEmitter<FiltroProdutoCatalogo>();
  @Output() termChanged = new EventEmitter<string>();

  ngOnInit(): void {}
}
