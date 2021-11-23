import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GrupoItemDELI, GrupoItemDELIFilho, GrupoItemDELIFilhoGrouped } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoService } from '../../definicao-escopo-loja-insumo.service';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DefinicaoEscopoLojaInsumoState } from '../../state/definicao-escopo-loja-insumo.state';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-del-grupo-item-content',
  templateUrl: './deli-grupo-item-content.component.html',
  styleUrls: ['./deli-grupo-item-content.component.scss'],
  animations: [fadeOutAnimation(), collapseAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliGrupoItemContentComponent implements OnInit {
  constructor(public definicaoEscopoLojaService: DefinicaoEscopoLojaInsumoService, private store: Store) {}

  @Input() grupoItem: GrupoItemDELI;
  filhosGrouped$: Observable<GrupoItemDELIFilhoGrouped[]>;

  trackByGrouped = trackByFactory<GrupoItemDELIFilhoGrouped>('descricao');
  trackByGrupoItemFilho = trackByFactory<GrupoItemDELIFilho>('idOrcamentoGrupoItem');

  openQuantitativo(): void {
    if (!this.grupoItem.openedQuantitativo) {
      this.definicaoEscopoLojaService.setGrupoItemQuantitativoApi(this.grupoItem.idOrcamentoGrupoItem);
    } else {
      this.definicaoEscopoLojaService.updateGrupoItem(this.grupoItem.idOrcamentoGrupoItem, {
        openedQuantitativo: false,
      });
    }
  }

  ngOnInit(): void {
    this.filhosGrouped$ = this.store.select(
      DefinicaoEscopoLojaInsumoState.getGrupoItemFilhosGrouped(this.grupoItem.idOrcamentoGrupoItem)
    );
  }
}
