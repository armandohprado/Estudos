import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GrupoItemTecnico, GrupoItemTecnicoFilho, GrupoItemTecnicoFilhoGrouped } from '../../models/grupo-item';
import { DefinicaoEscopoGrupoTecnicoService } from '../../definicao-escopo-grupo-tecnico.service';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DefinicaoEscopoGrupoTecnicoState } from '../../state/definicao-escopo-grupo-tecnico.state';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-del-grupo-item-content',
  templateUrl: './det-grupo-item-content.component.html',
  styleUrls: ['./det-grupo-item-content.component.scss'],
  animations: [fadeOutAnimation(), collapseAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetGrupoItemContentComponent implements OnInit {
  constructor(public definicaoEscopoLojaService: DefinicaoEscopoGrupoTecnicoService, private store: Store) {}

  @Input() grupoItem: GrupoItemTecnico;
  filhosGrouped$: Observable<GrupoItemTecnicoFilhoGrouped[]>;

  trackByGrouped = trackByFactory<GrupoItemTecnicoFilhoGrouped>('descricao');
  trackByGrupoItemFilho = trackByFactory<GrupoItemTecnicoFilho>('idOrcamentoGrupoItem');

  ngOnInit(): void {
    this.filhosGrouped$ = this.store.select(
      DefinicaoEscopoGrupoTecnicoState.getGrupoItemFilhosGrouped(this.grupoItem.idOrcamentoGrupoItem)
    );
  }
}
