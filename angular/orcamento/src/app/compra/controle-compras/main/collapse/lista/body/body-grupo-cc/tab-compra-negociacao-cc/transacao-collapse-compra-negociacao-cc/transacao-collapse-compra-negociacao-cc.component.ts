import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { trackByFactory } from '@aw-utils/track-by';
import { CnTransacao } from '../../../../../../../../models/cn-transacao';
import { CnTransacoesAtual } from '../../../../../../../../models/cn-transacoes-atual';

@Component({
  selector: 'app-transacao-collapse-compra-negociacao-cc',
  templateUrl: './transacao-collapse-compra-negociacao-cc.component.html',
  styleUrls: ['./transacao-collapse-compra-negociacao-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransacaoCollapseCompraNegociacaoCcComponent {
  @Input() transacoesAtual: CnTransacoesAtual;

  readonly trackByTransacao = trackByFactory<CnTransacao>('idCompraNegociacaoGrupoTransacao');
}
