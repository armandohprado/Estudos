import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Quantitativo } from '../../../../definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';
import { DefinicaoEscopoLojaInsumoService } from '../../../definicao-escopo-loja-insumo.service';
import { AtualizacaoCentroCustoEvent } from '../../../../definicao-escopo/shared/de-distribuir-quantitativo/model/atualizacao-centro-custo-event';
import { GrupoItemDELITab } from '../../../models/grupo-item';

@Component({
  selector: 'app-del-gi-quantificar',
  templateUrl: './deli-gi-quantificar.component.html',
  styleUrls: ['./deli-gi-quantificar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliGiQuantificarComponent {
  constructor(public definicaoEscopoLojaService: DefinicaoEscopoLojaInsumoService) {}

  @Input() idOrcamentoGrupoItem: number;
  @Input() activeTab: GrupoItemDELITab;
  @Input() quantitativo: Quantitativo;
  @Input() isLoading: boolean;

  grupoItemDELITab = GrupoItemDELITab;

  updateQuantitativo($event: AtualizacaoCentroCustoEvent): void {
    this.definicaoEscopoLojaService.updateGrupoItemQuantitativoApi(
      this.idOrcamentoGrupoItem,
      $event.fase.idFase,
      $event.pavimento,
      $event.centroCusto,
      $event.newQtde
    );
  }

  selectTab(activeTab: GrupoItemDELITab): void {
    this.definicaoEscopoLojaService.updateGrupoItem(this.idOrcamentoGrupoItem, { activeTab });
  }

  updateTotal($event: number): void {
    this.definicaoEscopoLojaService.updateGrupoItem(this.idOrcamentoGrupoItem, {
      quantidadeTotal: $event,
    });
  }

  refreshQuantitativo(): void {
    this.definicaoEscopoLojaService.setGrupoItemQuantitativoApi(this.idOrcamentoGrupoItem);
  }
}
