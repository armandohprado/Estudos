import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { PropostaAltFornecedor, PropostaAltFornecedorContato, PropostaAlt } from '@aw-models/index';
import { trackByFactory } from '@aw-utils/track-by';
import { MaskEnum } from '@aw-models/mask.enum';

@Component({
  selector: 'app-proposta-info',
  templateUrl: './proposta-info.component.html',
  styleUrls: ['./proposta-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropostaInfoComponent {
  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  showMore = false;
  maskEnum = MaskEnum;

  @Input() proposta: PropostaAlt;
  @Input() fornecedor: PropostaAltFornecedor;

  trackByContato = trackByFactory<PropostaAltFornecedorContato>('idContato');

  toggleShowMore(): void {
    this.showMore = !this.showMore;
    this.changeDetectorRef.markForCheck();
  }
}
