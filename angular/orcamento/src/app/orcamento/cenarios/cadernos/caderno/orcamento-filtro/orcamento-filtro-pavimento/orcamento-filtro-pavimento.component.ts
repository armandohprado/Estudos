import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  TrackByFunction,
} from '@angular/core';
@Component({
  selector: 'app-orcamento-filtro-pavimento',
  templateUrl: './orcamento-filtro-pavimento.component.html',
  styleUrls: ['./orcamento-filtro-pavimento.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrcamentoFiltroPavimentoComponent<T extends { exibe: boolean }> implements OnInit {
  constructor() {}
  @Input() filtros: T[] = [];

  @Input() conteudo: T[];
  @Output() selecionado = new EventEmitter<T[]>();
  @Input() nome1: string;
  @Input() nome2: string;
  @Input() trackBy: TrackByFunction<T>;

  ngOnInit(): void {}

  selectAll(exibe: boolean): void {
    this.selecionado.emit(
      this.filtros.map(filtro => {
        return { ...filtro, exibe };
      })
    );
  }

  update(exibe: boolean, obj: T): void {
    this.selecionado.emit([{ ...obj, exibe }]);
  }

  get allSelected(): boolean {
    return this.filtros.every(filtro => filtro.exibe);
  }
}
