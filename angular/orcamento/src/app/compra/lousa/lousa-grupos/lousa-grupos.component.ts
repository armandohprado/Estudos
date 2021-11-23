import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { trackByFactory } from '@aw-utils/track-by';
import { LousaGrupo } from '../../models/lousa-grupo';
import { LousaConfirmacaoCompra } from '../../models/lousa-confirmacao-compra';

@Component({
  selector: 'app-lousa-grupos',
  templateUrl: './lousa-grupos.component.html',
  styleUrls: ['./lousa-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LousaGruposComponent {
  @Input() grupos: LousaGrupo[] = [];
  @Input() hiddenColumns = true;

  readonly trackByLousaGrupo = trackByFactory<LousaGrupo>('idCompraNegociacaoGrupo');
  readonly trackByConfirmacaoCompra = trackByFactory<LousaConfirmacaoCompra>('idConfirmacaoCompra');
}
