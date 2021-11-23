import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EpPropostaItem } from '../model/item';
import { EpPropostaItemQuery } from '../state/item/ep-proposta-item.query';
import { EqualizacaoPropostaService } from '../equalizacao-proposta.service';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { trackByEpPropostaItem } from '../utils';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-ep-itens-omissos',
  templateUrl: './ep-itens-omissos.component.html',
  styleUrls: ['./ep-itens-omissos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class EpItensOmissosComponent {
  constructor(
    public epPropostaItemQuery: EpPropostaItemQuery,
    private equalizacaoPropostaService: EqualizacaoPropostaService,
    private awDialogService: AwDialogService
  ) {}

  @Input() propostaItens: EpPropostaItem[] = [];
  @Input() idOrcamentoGrupo: number;
  @Input() idOrcamentoCenario: number;

  trackByEpPropostaItem = trackByEpPropostaItem;

  toggleCollapseValorUnitario(propostaItem: EpPropostaItem): void {
    this.equalizacaoPropostaService.toggleCollapseItemOmissoValorUnitario(propostaItem.idPropostaItem);
  }

  toggleCollapseDescricao(propostaItem: EpPropostaItem): void {
    this.equalizacaoPropostaService.toggleCollapseItemOmissoDescricao(propostaItem.idPropostaItem);
  }

  addOmisso(propotaItem: EpPropostaItem): void {
    this.equalizacaoPropostaService
      .adicionarItemOmissoAoEscopo(
        this.idOrcamentoGrupo,
        this.idOrcamentoCenario,
        propotaItem.idProposta,
        propotaItem.idPropostaItem
      )
      .subscribe();
  }

  deleteOmisso(propostaItem: EpPropostaItem): void {
    this.awDialogService.warning({
      title: 'Você tem certeza que deseja excluir o Item Omisso',
      content: 'Esta ação não pode ser desfeita.',
      primaryBtn: {
        title: 'Excluir',
        useDefaultWidth: true,
        action: bsModalRef =>
          this.equalizacaoPropostaService.excluirItemOmisso(propostaItem.idProposta, propostaItem.idPropostaItem).pipe(
            finalize(() => {
              bsModalRef.hide();
            })
          ),
      },
      secondaryBtn: {
        title: 'Cancelar',
        useDefaultWidth: true,
      },
      bsModalOptions: { ignoreBackdropClick: true },
    });
  }
}
