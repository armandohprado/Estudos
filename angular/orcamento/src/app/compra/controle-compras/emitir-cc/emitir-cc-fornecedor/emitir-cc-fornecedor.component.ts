import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MaskEnum } from '@aw-models/mask.enum';
import { FormGroup } from '@angular/forms';
import { CnEmitirCc, CnEmitirCcTipificacao } from '../../../models/cn-emitir-cc';
import { ContatoAlt } from '../../../../models';
import { awSelectComparatorFactory } from '@aw-components/aw-select/aw-select.config';
import { ControleComprasQuery } from '../../state/controle-compras/controle-compras.query';
import { trackByFactory } from '@aw-utils/track-by';
import { EmpresaFaturamento } from '@aw-models/empresa-faturamento';

@Component({
  selector: 'app-emitir-cc-fornecedores',
  templateUrl: './emitir-cc-fornecedor.component.html',
  styleUrls: [
    './emitir-cc-fornecedor.component.scss',
    '../../main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/tab-confirmacao-compra-cc.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmitirCcFornecedorComponent {
  constructor(public controleComprasQuery: ControleComprasQuery) {}

  readonly maskEnum = MaskEnum;

  @Input() contatos: ContatoAlt[];
  @Input() form: FormGroup;
  @Input() emitirCc: CnEmitirCc;

  readonly contatoComparator = awSelectComparatorFactory<ContatoAlt>('idContato');
  readonly empresaComparator = awSelectComparatorFactory<EmpresaFaturamento>('idFaturamentoCobranca');
  readonly trackByTipificacao = trackByFactory<CnEmitirCcTipificacao>('idTipificacao');
  readonly trackByContatoAlt = trackByFactory<ContatoAlt>('idContato');
  readonly trackByEmpresaFaturamento = trackByFactory<EmpresaFaturamento>('idFaturamentoCobranca');
}
