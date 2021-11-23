import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { GrupoItemDELI } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoService } from '../../definicao-escopo-loja-insumo.service';
import { DuplicarGrupoItem, getDuplicarKeys, trackByDuplicarKeys } from '../../../definicao-escopo/model/duplicar';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Store } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoActions } from '../../state/actions';

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
    private changeDetectorRef: ChangeDetectorRef,
    private definicaoEscopoLojaService: DefinicaoEscopoLojaInsumoService,
    private store: Store
  ) {}

  @Input() grupoItem: GrupoItemDELI;
  @ViewChild('duplicar') duplicarRef: PopoverDirective;

  duplicarOptions = getDuplicarKeys().filter(o => !/^(todos|atributos|valorReferencia|comentario)$/.test(o.key));
  trackByDuplicarKeys = trackByDuplicarKeys;
  todos = false;
  todosIndeterminate = false;

  change(): void {
    this.todos = this.duplicarOptions.every(o => o.control);
    this.todosIndeterminate = !this.todos && this.duplicarOptions.some(o => o.control);
    this.changeDetectorRef.markForCheck();
  }

  todosChange($event: boolean): void {
    this.duplicarOptions = this.duplicarOptions.map(o => ({ ...o, control: $event }));
    this.changeDetectorRef.markForCheck();
  }

  collapse(opened: boolean): void {
    if (!opened) {
      this.definicaoEscopoLojaService.setGrupoItemFilhosApi(
        this.grupoItem.idOrcamentoGrupoItem,
        this.grupoItem.idGrupoItem
      );
    } else {
      this.definicaoEscopoLojaService.updateGrupoItem(this.grupoItem.idOrcamentoGrupoItem, { opened: !opened });
    }
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
    this.store.dispatch(new DefinicaoEscopoLojaInsumoActions.duplicarGrupoItemApi(payload)).subscribe(() => {
      this.duplicarRef.hide();
      this.duplicarOptions = this.duplicarOptions.map(o => ({ ...o, control: false }));
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {}
}
