import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { GrupoItemKit } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoKitService } from '../../definicao-escopo-loja-insumo-kit.service';
import {
  DuplicarGrupoItem,
  DuplicarGrupoItemKeysArray,
  getDuplicarKeys,
} from '../../../definicao-escopo/model/duplicar';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Store } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitActions } from '../../state/actions';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-del-grupo-item-acoes',
  templateUrl: './deli-grupo-item-acoes.component.html',
  styleUrls: [
    '../../../definicao-escopo/de-grupo-item/de-grupo-item-acoes/de-grupo-item-acoes.component.scss',
    './deli-grupo-item-acoes.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliGrupoItemAcoesComponent implements OnInit {
  constructor(
    private definicaoEscopoLojaService: DefinicaoEscopoLojaInsumoKitService,
    private store: Store,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() grupoItem: GrupoItemKit;
  @ViewChild('duplicar') duplicarRef: PopoverDirective;

  duplicarOptions = getDuplicarKeys().filter(o => !/^(todos|atributos|valorReferencia|comentario)$/.test(o.key));
  todos = false;
  todosIndeterminate = false;

  trackByKey = trackByFactory<DuplicarGrupoItemKeysArray>('key');

  change(): void {
    this.todos = this.duplicarOptions.every(o => o.control);
    this.todosIndeterminate = !this.todos && this.duplicarOptions.some(o => o.control);
    this.changeDetectorRef.markForCheck();
  }

  todosChange($event: boolean): void {
    this.duplicarOptions = this.duplicarOptions.map(o => ({ ...o, control: $event }));
    this.changeDetectorRef.markForCheck();
  }

  collapse(): void {
    this.definicaoEscopoLojaService.toggleCollapseGrupoItem(
      this.grupoItem.idOrcamentoGrupoItem,
      this.grupoItem.idGrupoItem
    );
  }

  duplicarItem(): void {
    const payload = {
      ...this.duplicarOptions.reduce((acc, item) => {
        acc[item.key] = item.control;
        return acc;
      }, {}),
      todos: this.todos,
      idOrcamentoGrupoItem: this.grupoItem.idOrcamentoGrupoItem,
    } as DuplicarGrupoItem;
    this.store.dispatch(new DefinicaoEscopoLojaInsumoKitActions.duplicarGrupoItemApi(payload)).subscribe(() => {
      this.duplicarRef.hide();
      this.duplicarOptions = this.duplicarOptions.map(o => ({ ...o, control: false }));
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {}
}
