import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SkipSelf } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AdicionarFornecedorTipoEnum } from '../adicionar-fornecedor.component';
import { Fornecedor } from '@aw-models/index';
import { CnCausa } from '../../../compra/models/cn-causa';

@Component({
  selector: 'app-adicionar-fornecedor-form',
  templateUrl: './adicionar-fornecedor-form.component.html',
  styleUrls: ['./adicionar-fornecedor-form.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: (container: ControlContainer) => container,
      deps: [[new SkipSelf(), ControlContainer]],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdicionarFornecedorFormComponent {
  @Input() fornecedores: Fornecedor[] = [];
  @Input() loadingFornecedores: boolean;
  @Input() listaCausa: CnCausa[];
  @Input() fornecedorTipo: AdicionarFornecedorTipoEnum;

  @Output() readonly search = new EventEmitter<string>();

  readonly adicionarFornecedorTipoEnum = AdicionarFornecedorTipoEnum;
}
