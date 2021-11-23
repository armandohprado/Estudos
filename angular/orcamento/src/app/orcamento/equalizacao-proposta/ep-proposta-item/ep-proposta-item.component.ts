import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EpPropostaItem } from '../model/item';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { EqualizacaoPropostaService } from '../equalizacao-proposta.service';
import { EpPropostaItemQuery } from '../state/item/ep-proposta-item.query';
import { trackByEpPropostaItem, trackByEpPropostaItemQuantitativoItem } from '../utils';

@Component({
  selector: 'app-ep-proposta-item',
  templateUrl: './ep-proposta-item.component.html',
  styleUrls: ['./ep-proposta-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class EpPropostaItemComponent {
  constructor(
    private equalizacaoPropostaService: EqualizacaoPropostaService,
    public epPropostaItemQuery: EpPropostaItemQuery
  ) {}

  @Input() propostaItem: EpPropostaItem;
  @Input() classificacao: number;
  @Input() idOrcamentoCenario: number;

  trackByEpPropostaItem = trackByEpPropostaItem;
  trackByEpPropostaItemQuantitativoItem = trackByEpPropostaItemQuantitativoItem;

  toggleCollapseValorUnitario(): void {
    this.equalizacaoPropostaService.toggleCollapseItemValorUnitario(this.propostaItem.idOrcamentoGrupoItem);
  }

  toggleCollapseDescricao(): void {
    this.equalizacaoPropostaService.toggleCollapseItemDescricao(this.propostaItem.idOrcamentoGrupoItem);
  }

  toggleCollapseQuantitativo({ quantitativoOpened, idOrcamentoGrupoItem, quantitativos }: EpPropostaItem): void {
    if (!quantitativoOpened) {
      this.equalizacaoPropostaService.openQuantitativo(idOrcamentoGrupoItem, !!quantitativos?.length).subscribe();
    } else {
      this.equalizacaoPropostaService.closeQuantitativo(idOrcamentoGrupoItem);
    }
  }
}
