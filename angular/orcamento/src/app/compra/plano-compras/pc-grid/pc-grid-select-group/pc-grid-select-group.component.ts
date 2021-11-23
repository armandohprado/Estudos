import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlanoComprasQuery } from '../../state/plano-compras/plano-compras.query';
import { Observable } from 'rxjs';
import { PlanoCompras } from '../../models/plano-compras';
import { trackByFactory } from '../../../../utils/track-by';

@Component({
  selector: 'app-pc-grid-select-group',
  templateUrl: './pc-grid-select-group.component.html',
  styleUrls: ['./pc-grid-select-group.component.scss'],
})
export class PcGridSelectGroupComponent implements OnInit {
  constructor(private planoComprasQuery: PlanoComprasQuery) {}
  grupos$: Observable<PlanoCompras[]>;
  @Input() height = 424;
  @Input() selecionados: number[] = [];
  @Output() selecionadosChange = new EventEmitter<number[]>();
  trackBy = trackByFactory<PlanoCompras>('idPlanoCompraGrupo');

  ngOnInit(): void {
    this.grupos$ = this.planoComprasQuery.selectAll();
  }

  toggleSelecao(grupo: PlanoCompras): void {
    const selecionado = this.selecionados.includes(grupo.idPlanoCompraGrupo);
    if (selecionado) {
      this.selecionados = this.selecionados.filter(id => id !== grupo.idPlanoCompraGrupo);
    } else {
      this.selecionados.push(grupo.idPlanoCompraGrupo);
    }
    this.selecionadosChange.emit(this.selecionados);
  }
}
