import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LousaCabecalho, LousaCabecalhoValorKeys } from '../../models/lousa-cabecalho';
import { trackByFactory } from '@aw-utils/track-by';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-lousa-header',
  templateUrl: './lousa-header.component.html',
  styleUrls: ['./lousa-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LousaHeaderComponent {
  @Input() cabecalhos: LousaCabecalho[];

  readonly keyValues: KeyValue<LousaCabecalhoValorKeys, string>[] = [
    { key: 'totalFaturamentoDireto', value: 'Faturamento direto' },
    { key: 'totalMiscellaneous', value: 'Miscellâneous' },
    { key: 'totalRevenda', value: 'Revenda' },
    { key: 'totalCustoCompra', value: 'Custo de compra' },
    { key: 'totalEquipe', value: 'Equipe' },
    { key: 'totalTaxa', value: 'Taxa' },
    { key: 'totalEncontroContas', value: 'Encontro de compras' },
    { key: 'totalCorrecaoObra', value: 'Correção de obra' },
  ];

  readonly trackByKeyValue = trackByFactory<KeyValue<LousaCabecalhoValorKeys, string>>('key');
  readonly trackByCabecalho = trackByFactory<LousaCabecalho>('nome');
}
