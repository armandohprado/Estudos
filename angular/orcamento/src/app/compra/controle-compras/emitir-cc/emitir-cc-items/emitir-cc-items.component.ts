import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  CnEmitirCcCentroCusto,
  CnEmitirCc,
  CnEmitirCcPavimentoItem,
  CnEmitirCcPavimento,
} from '../../../models/cn-emitir-cc';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-emitir-cc-items',
  templateUrl: './emitir-cc-items.component.html',
  styleUrls: [
    './emitir-cc-items.component.scss',
    '../../main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/tab-confirmacao-compra-cc.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmitirCcItemsComponent {
  @Input() emitirCc: CnEmitirCc;

  readonly trackByPavimento = trackByFactory<CnEmitirCcPavimento>('idProjetoEdificioPavimento');
  readonly trackByCentroCusto = trackByFactory<CnEmitirCcCentroCusto>('idProjetoCentroCusto');
  readonly trackByItem = trackByFactory<CnEmitirCcPavimentoItem>('idPropostaItem');
}
