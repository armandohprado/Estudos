import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-orcamento-header',
  templateUrl: './orcamento-header.component.html',
  styleUrls: ['./orcamento-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrcamentoHeaderComponent {
  @Input() nomeOrcamento: string;
  @Input() nomeProjeto: string;
  @Input() numeroProjeto: string;
}
