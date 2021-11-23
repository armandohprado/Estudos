import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Grupo } from '@aw-models/grupo';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grupo',
  templateUrl: './grupo.component.html',
  styleUrls: ['./grupo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrupoComponent implements OnInit {
  constructor(private changeDetectorRef: ChangeDetectorRef, private router: Router) {}

  disabledGrupo = false;

  @Input() selectionMode = false;
  @Input() grupo: Grupo;
  @Input() id: string;
  @Input() custoPrevisto = false;
  @Input() showPercentual: boolean;

  @Output() readonly selection = new EventEmitter<Grupo>();

  ngOnInit(): void {
    if (
      this.grupo.selecionado &&
      (this.grupo.propostas?.length > 0 ||
        (this.router.url.includes('plano-compras') && this.grupo.selecionadoPlanoCompras))
    ) {
      this.disabledGrupo = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  select(): void {
    if (this.disabledGrupo) {
      return;
    }
    this.grupo.grupoNaoPrevisto = this.grupo.grupoNaoPrevisto ?? false;
    this.selection.emit(this.grupo);
  }
}
