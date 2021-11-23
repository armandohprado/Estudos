import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChangeOrderService } from '../services/change-order.service';
import { CenarioStatusEnum } from '@aw-models/index';
import { Observable } from 'rxjs';
import { ChangeOrder } from '../models/change-order';
import { map } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';

interface ChangeOrderGrouped {
  status: number;
  nome: string;
  type: 'success' | 'warning' | 'secondary' | 'primary' | 'orange';
  lista: ChangeOrder[];
}

@Component({
  selector: 'app-change-order-card',
  templateUrl: './change-order-card.component.html',
  styleUrls: ['./change-order-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeOrderCardComponent {
  constructor(private changeOrderService: ChangeOrderService) {}

  readonly changeOrderGrouped$: Observable<ChangeOrderGrouped[]> = this.changeOrderService.changeOrders$.pipe(
    map(changeOrders => {
      const status: ChangeOrderGrouped[] = [
        { status: CenarioStatusEnum.congelado, nome: 'Congelados', type: 'secondary', lista: [] },
        { status: CenarioStatusEnum.propostaAprovada, nome: 'Aprovados', type: 'success', lista: [] },
        { status: CenarioStatusEnum.analiseCliente, nome: 'Em análise pelo cliente', type: 'orange', lista: [] },
        { status: CenarioStatusEnum.emEdicao, nome: 'Em edição', type: 'warning', lista: [] },
        { status: CenarioStatusEnum.reprovados, nome: 'Reprovados', type: 'secondary', lista: [] },
      ];
      return status
        .map(changeOrderGroup => ({
          ...changeOrderGroup,
          lista: changeOrders.filter(changeOrder => changeOrder.idCenarioStatus === changeOrderGroup.status),
        }))
        .filter(group => group.lista.length);
    })
  );

  readonly trackByChangeOrder = trackByFactory<ChangeOrder>('idOrcamentoChangeOrder', 'idOrcamentoGrupoClassificacao');
  readonly trackByStatus = trackByFactory<ChangeOrderGrouped>('status');
}
