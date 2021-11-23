import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Quantitativo } from '../../../../definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';
import { DefinicaoEscopoLojaInsumoKitService } from '../../../definicao-escopo-loja-insumo-kit.service';

import { AtualizacaoCentroCustoEvent } from '../../../../definicao-escopo/shared/de-distribuir-quantitativo/model/atualizacao-centro-custo-event';
import { GrupoItemDELITab } from '../../../../definicao-escopo-loja-insumo/models/grupo-item';

@Component({
  selector: 'app-del-gi-quantificar',
  templateUrl: './deli-gi-quantificar.component.html',
  styleUrls: ['./deli-gi-quantificar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliGiQuantificarComponent implements OnInit {
  constructor(public definicaoEscopoLojaInsumoKitService: DefinicaoEscopoLojaInsumoKitService) {}

  @Input() idOrcamentoGrupoItem: number;
  @Input() activeTab: GrupoItemDELITab;
  @Input() quantitativo: Quantitativo;
  @Input() isLoading: boolean;

  grupoItemDELITab = GrupoItemDELITab;

  updateQuantitativo($event: AtualizacaoCentroCustoEvent): void {
    this.definicaoEscopoLojaInsumoKitService.updateGrupoItemQuantitativoApi(
      this.idOrcamentoGrupoItem,
      $event.fase.idFase,
      $event.pavimento,
      $event.centroCusto,
      $event.newQtde
    );
  }

  selectTab(activeTabQuantificar: GrupoItemDELITab): void {
    this.definicaoEscopoLojaInsumoKitService.updateGrupoItem(this.idOrcamentoGrupoItem, { activeTabQuantificar });
  }

  updateTotal($event: number): void {
    this.definicaoEscopoLojaInsumoKitService.updateGrupoItem(this.idOrcamentoGrupoItem, {
      quantidadeTotal: $event,
    });
  }

  ngOnInit(): void {
    this.definicaoEscopoLojaInsumoKitService.setGrupoItemQuantitativoApi(this.idOrcamentoGrupoItem);
  }

  refreshQuantitativo(): void {
    this.definicaoEscopoLojaInsumoKitService.setGrupoItemQuantitativoApi(this.idOrcamentoGrupoItem);
  }
}
