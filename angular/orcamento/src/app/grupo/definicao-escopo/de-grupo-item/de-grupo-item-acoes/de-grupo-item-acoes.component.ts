import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { GrupoItemDE } from '../../model/grupo-item';
import { DefinicaoEscopoService } from '../../definicao-escopo.service';
import {
  DuplicarGrupoItem,
  DuplicarGrupoItemKeys,
  DuplicarGrupoItemKeysArray,
  getDuplicarKeys,
} from '../../model/duplicar';
import { Store } from '@ngxs/store';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { DefinicaoEscopoActions } from '../../state/actions';
import { trackByFactory } from '@aw-utils/track-by';
import { CurrencyMaskConfig } from 'ngx-currency';

@Component({
  selector: 'app-de-grupo-item-acoes',
  templateUrl: './de-grupo-item-acoes.component.html',
  styleUrls: ['./de-grupo-item-acoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeGrupoItemAcoesComponent {
  constructor(
    public definicaoEscopoService: DefinicaoEscopoService,
    private store: Store,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() grupoItem: GrupoItemDE;

  options: DuplicarGrupoItemKeysArray[] = getDuplicarKeys().filter(o => o.key !== 'produtoCatalogo');

  @ViewChild('duplicar') readonly duplicarPop: PopoverDirective;

  showMessage = false;
  hideMessageEvent: any;
  numeroCopias = 1;

  readonly currencyMaskOptions: Partial<CurrencyMaskConfig> = {
    min: 1,
    allowNegative: false,
    nullable: false,
    allowZero: false,
    precision: 0,
    align: 'center',
  };

  readonly trackByOptions = trackByFactory<DuplicarGrupoItemKeysArray>('key');

  duplicarGrupoItem(): void {
    if (this.hideMessageEvent) {
      clearTimeout(this.hideMessageEvent);
    }
    const payload: DuplicarGrupoItem = {
      ...this.options.reduce((acc, item) => ({ ...acc, [item.key]: item.control }), {} as DuplicarGrupoItem),
      idOrcamentoGrupoItem: this.grupoItem.idOrcamentoGrupoItem,
      numeroCopias: this.numeroCopias,
    };
    this.store.dispatch(new DefinicaoEscopoActions.duplicarGrupoItemApi(payload)).subscribe(() => {
      this.onChanged(false, 'todos');
      this.showMessage = true;
      this.hideMessageEvent = setTimeout(() => {
        if (this.duplicarPop.isOpen) {
          this.duplicarPop.hide();
        }
        this.changeDetectorRef.markForCheck();
      }, 3000);
      this.changeDetectorRef.markForCheck();
    });
  }

  onChanged(value: boolean, type: keyof DuplicarGrupoItemKeys): void {
    if (type === 'todos') {
      this.options = this.options.map(option => ({ ...option, control: value }));
    } else {
      this.options = this.options
        .map(option => {
          if (option.key === type) {
            option = { ...option, control: value };
          }
          return option;
        })
        .map((option, _, options) => {
          if (option.key === 'todos') {
            option = {
              ...option,
              control: options.filter(_option => _option.key !== 'todos').every(_option => _option.control),
            };
          }
          return option;
        });
    }
  }

  onDuplicarHidden(): void {
    this.showMessage = false;
    this.numeroCopias = 1;
    this.changeDetectorRef.markForCheck();
  }

  numeroCopiasMinus(): void {
    this.numeroCopias = Math.max(this.numeroCopias - 1, 1);
  }
}
