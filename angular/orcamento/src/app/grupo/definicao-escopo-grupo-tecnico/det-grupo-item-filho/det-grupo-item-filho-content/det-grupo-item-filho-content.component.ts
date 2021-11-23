import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GrupoItemTecnicoFilho, GrupoItemTecnicoFilhoTab } from '../../models/grupo-item';
import { DefinicaoEscopoGrupoTecnicoService } from '../../definicao-escopo-grupo-tecnico.service';
import { collapseAnimation } from '@aw-shared/animations/collapse';

@Component({
  selector: 'app-deli-grupo-item-filho-content',
  templateUrl: './det-grupo-item-filho-content.component.html',
  styleUrls: ['./det-grupo-item-filho-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class DetGrupoItemFilhoContentComponent {
  constructor(public definicaoEscopoGrupoTecnicoService: DefinicaoEscopoGrupoTecnicoService) {}

  @Input() grupoItemFilho: GrupoItemTecnicoFilho;
  @Input() idOrcamentoGrupoItemPai: number;

  grupoItemFilhoTab = GrupoItemTecnicoFilhoTab;

  onSelectTab(tab: GrupoItemTecnicoFilhoTab): void {
    this.definicaoEscopoGrupoTecnicoService.updateGrupoItemFilho(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      { activeTab: tab }
    );
  }

  refreshQuantitativo(): void {
    this.definicaoEscopoGrupoTecnicoService.setGrupoItemFilhoQuantitativoApi(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem
    );
  }
}
