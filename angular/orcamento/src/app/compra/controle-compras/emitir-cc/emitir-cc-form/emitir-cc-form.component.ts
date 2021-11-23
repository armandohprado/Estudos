import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CnEmitirCc } from '../../../models/cn-emitir-cc';

@Component({
  selector: 'app-emitir-cc-form',
  templateUrl: './emitir-cc-form.component.html',
  styleUrls: [
    '../../main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/tab-confirmacao-compra-cc.component.scss',
    './emitir-cc-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmitirCcFormComponent {
  @Input() form: FormGroup;
  @Input() emitirCc: CnEmitirCc;
  @Input() valorMiscellaneous: number;
}
