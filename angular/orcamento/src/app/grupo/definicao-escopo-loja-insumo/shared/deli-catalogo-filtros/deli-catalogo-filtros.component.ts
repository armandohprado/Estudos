import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FiltroCatalogo, FiltroProdutoCatalogo, FiltroValor, ProdutoCatalogo } from '../../models/produto-catalogo';
import { groupBy, uniqBy } from 'lodash-es';
import { Kit } from '../../../definicao-escopo-loja-insumo-kit/models/kit';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';

let uniqueId = 0;

@Component({
  selector: 'app-deli-catalogo-filtros',
  templateUrl: './deli-catalogo-filtros.component.html',
  styleUrls: ['./deli-catalogo-filtros.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliCatalogoFiltrosComponent implements OnInit, OnChanges, OnDestroy {
  constructor() {}

  private _destroy$ = new Subject<void>();

  uniqueId = uniqueId++;

  termSubject = new Subject<string>();

  @Input() catalogo: Array<ProdutoCatalogo | Kit>;
  @Input() filtrosAtivos: FiltroProdutoCatalogo[] = [];
  @Input() term: string;
  @Output() termChanged = new EventEmitter<string>();

  @Output() filtroChanged = new EventEmitter<FiltroProdutoCatalogo>();

  filtros: FiltroCatalogo[];

  trackByFiltroCatalogo = trackByFactory<FiltroCatalogo>('nome');
  trackByFiltroValor = trackByFactory<FiltroValor>('valor');

  onFiltro(nome: string, valor: any): void {
    this.filtroChanged.emit({ valor, nome });
  }

  private setFiltros(): void {
    const filtros = this.catalogo.reduce((acc: FiltroProdutoCatalogo[], item) => {
      return [...acc, ...item.filtros];
    }, []);
    const grouped = groupBy(filtros, 'nome');
    this.filtros = Object.entries(grouped).map(([key, value]) => {
      const uniqueValues = uniqBy(value, 'valor');
      return {
        nome: key,
        valores: uniqueValues.map(v => ({
          valor: v.valor,
          active: this.filtrosAtivos.some(f => f.nome === key && f.valor === v.valor),
        })),
      };
    });
  }

  ngOnInit(): void {
    this.termSubject.pipe(takeUntil(this._destroy$), debounceTime(400)).subscribe(term => {
      this.termChanged.emit(term);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.catalogo || changes.filtrosAtivos) {
      this.setFiltros();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
