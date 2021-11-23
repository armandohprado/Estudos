import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GrupoItemKit, GrupoItemKitFilho, GrupoItemKitFilhoGrouped } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoKitService } from '../../definicao-escopo-loja-insumo-kit.service';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DefinicaoEscopoLojaInsumoKitState } from '../../state/definicao-escopo-loja-insumo-kit.state';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { FiltroProdutoCatalogo } from '../../../definicao-escopo-loja-insumo/models/produto-catalogo';
import { Kit } from '../../models/kit';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-del-grupo-item-content',
  templateUrl: './deli-grupo-item-content.component.html',
  styleUrls: ['./deli-grupo-item-content.component.scss'],
  animations: [fadeOutAnimation(), collapseAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliGrupoItemContentComponent implements OnInit {
  constructor(public definicaoEscopoLojaService: DefinicaoEscopoLojaInsumoKitService, private store: Store) {}

  @Input() grupoItem: GrupoItemKit;
  filhosGrouped$: Observable<GrupoItemKitFilhoGrouped[]>;

  trackByGrouped = trackByFactory<GrupoItemKitFilhoGrouped>('descricao');
  trackByGrupoItemFilho = trackByFactory<GrupoItemKitFilho>('idOrcamentoGrupoItem');

  toggleCatalogo(): void {
    this.definicaoEscopoLojaService.updateGrupoItem(this.grupoItem.idOrcamentoGrupoItem, {
      openedCatalogo: !this.grupoItem.openedCatalogo,
    });
  }

  selectionChange({ selectedStep, selectedIndex }: StepperSelectionEvent): void {
    this.definicaoEscopoLojaService.updateGrupoItem(this.grupoItem.idOrcamentoGrupoItem, {
      activeTab: selectedStep.label,
      tabSelectedIndex: selectedIndex,
    });
  }

  updateFiltroCatalogo(filtro: FiltroProdutoCatalogo): void {
    this.definicaoEscopoLojaService.updateFiltroCatalogoGrupoItem(this.grupoItem.idOrcamentoGrupoItem, filtro);
  }

  updateTermCatalogo(term: string): void {
    this.definicaoEscopoLojaService.updateGrupoItem(this.grupoItem.idOrcamentoGrupoItem, { term });
  }

  kitSelecionadoCatalogo(kit: Kit): void {
    if (kit.selecionadoCatalogo) {
      this.definicaoEscopoLojaService.excluirProdutoGrupoItemApi(this.grupoItem.idOrcamentoGrupoItem, kit.idKit);
    } else {
      this.definicaoEscopoLojaService.incluirProdutoGrupoItemApi(this.grupoItem.idOrcamentoGrupoItem, {
        idKit: kit.idKit,
        idOrcamentoGrupoItem: this.grupoItem.idOrcamentoGrupoItem,
        idOrcamentoGrupoItemKit: 0,
        selecionado: false,
        idFornecedor: kit.idFornecedor,
      });
    }
  }

  kitSelecionado(kit: Kit): void {
    this.definicaoEscopoLojaService.setProdutoSelecionadoGrupoItem(
      this.grupoItem.idOrcamentoGrupoItem,
      kit.idOrcamentoGrupoItemKit,
      true
    );
  }

  kitDeletado(kit: Kit): void {
    this.definicaoEscopoLojaService.excluirProdutoGrupoItemApi(this.grupoItem.idOrcamentoGrupoItem, kit.idKit);
  }

  ngOnInit(): void {
    this.filhosGrouped$ = this.store.select(
      DefinicaoEscopoLojaInsumoKitState.getGrupoItemFilhosGrouped(this.grupoItem.idOrcamentoGrupoItem)
    );
  }
}
