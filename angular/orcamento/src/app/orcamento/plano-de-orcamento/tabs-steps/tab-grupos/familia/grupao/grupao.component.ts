import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Grupao, Grupo } from '../../../../../../models';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { trackByFactory } from '@aw-utils/track-by';
import { collapseAnimation } from '@aw-shared/animations/collapse';

@Component({
  selector: 'app-grupao',
  templateUrl: './grupao.component.html',
  styleUrls: ['./grupao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeOutAnimation(), collapseAnimation()],
})
export class GrupaoComponent {
  @Input() selectionMode = false;
  @Input() emitValueOnSelection: boolean;
  @Input() custoPrevisto: boolean;
  @Input() showPercentual: boolean;
  @Output() readonly selectionChange = new EventEmitter();

  isCollapsed = true;
  grupao: Grupao;

  trackByFn = trackByFactory<Grupo>('idOrcamentoGrupo');

  @Input('grupao')
  set _grupao(grupao: Grupao) {
    const newGrupao = { ...grupao };
    this.grupao = {
      ...newGrupao,
      grupos: (newGrupao.grupos ?? []).map(grupo => ({
        ...grupo,
        exibeGrupo: !grupo.ativo && !grupo.selecionado,
      })),
    };
  }

  @HostBinding('class.has-selected-groups')
  get hasSelectedGrupos(): boolean {
    return this.grupao.grupos.some(grupo => grupo.selecionado);
  }

  onSelection(grupo: Grupo): void {
    const payload = { ...this.grupao, grupos: [grupo] };
    this.selectionChange.emit(payload);
  }
}
