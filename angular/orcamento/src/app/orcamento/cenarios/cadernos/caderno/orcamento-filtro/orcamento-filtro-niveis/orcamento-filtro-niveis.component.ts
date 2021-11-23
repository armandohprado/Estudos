import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CadernoConfiguracaoNivel } from '@aw-models/cadernos/caderno';
import { trackByFactory } from '@aw-utils/track-by';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-orcamento-filtro-niveis',
  templateUrl: './orcamento-filtro-niveis.component.html',
  styleUrls: ['./orcamento-filtro-niveis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrcamentoFiltroNiveisComponent implements OnInit {
  constructor(public cadernosService: CadernosService) {}
  @Input() niveis: CadernoConfiguracaoNivel[];
  @Output() selecionado = new EventEmitter<CadernoConfiguracaoNivel>();
  trackByNiveis = trackByFactory('idCadernoConfiguracaoNivel');

  ngOnInit(): void {}

  output(exibe: boolean, nivel: CadernoConfiguracaoNivel): void {
    this.selecionado.emit({ ...nivel, exibe });
  }
  drop(event: CdkDragDrop<CadernoConfiguracaoNivel[]>): void {
    const caderno = this.cadernosService.caderno$.value;
    const nivelPre = caderno.cadernoConfiguracaoNivel.find(nivel => nivel.ordem === event.previousIndex + 1);
    const nivelCurrent = caderno.cadernoConfiguracaoNivel.find(nivel => nivel.ordem === event.currentIndex + 1);
    this.cadernosService.caderno$.next({
      ...caderno,
      cadernoConfiguracaoNivel: caderno.cadernoConfiguracaoNivel.map(nivel => {
        if (nivel === nivelPre) {
          nivel = { ...nivel, ordem: event.currentIndex + 1 };
        }
        if (nivel === nivelCurrent) {
          nivel = { ...nivel, ordem: event.previousIndex + 1 };
        }
        return nivel;
      }),
    });
  }
}
