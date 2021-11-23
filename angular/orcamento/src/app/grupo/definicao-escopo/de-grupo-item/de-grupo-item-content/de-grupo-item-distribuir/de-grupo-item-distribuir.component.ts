import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GrupoItemDE } from '../../../model/grupo-item';
import { DefinicaoEscopoService } from '../../../definicao-escopo.service';
import { AtualizacaoCentroCustoEvent } from '../../../shared/de-distribuir-quantitativo/model/atualizacao-centro-custo-event';

@Component({
  selector: 'app-de-grupo-item-distribuir',
  templateUrl: './de-grupo-item-distribuir.component.html',
  styleUrls: ['./de-grupo-item-distribuir.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeGrupoItemDistribuirComponent implements OnInit {
  constructor(public definicaoEscopoService: DefinicaoEscopoService) {}

  @Input() grupoItem: GrupoItemDE;

  updateQuantitativo({ newQtde, centroCusto, fase, pavimento }: AtualizacaoCentroCustoEvent): void {
    this.definicaoEscopoService.updateGrupoItemQuantitativoApi(
      this.grupoItem.idOrcamentoGrupoItem,
      fase.idFase,
      pavimento,
      centroCusto,
      newQtde
    );
  }

  updateTotal($event: number): void {
    this.definicaoEscopoService.updateGrupoItem(this.grupoItem.idOrcamentoGrupoItem, { quantidadeTotal: $event });
  }

  ngOnInit(): void {
    this.definicaoEscopoService.setGrupoItemQuantitativoApi(this.grupoItem.idOrcamentoGrupoItem);
  }
}
