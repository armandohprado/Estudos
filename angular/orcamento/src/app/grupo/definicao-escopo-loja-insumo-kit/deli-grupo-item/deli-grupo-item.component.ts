import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GrupoItemKit, GrupoItemKitID, KeyofGrupoItemKit } from '../models/grupo-item';
import { DefinicaoEscopoLojaInsumoKitService } from '../definicao-escopo-loja-insumo-kit.service';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { UpdateGrupoItemComplementoApi } from '../state/actions/update-grupo-item-complemento-api';
import { DefinicaoEscopoLojaInsumoKitState } from '../state/definicao-escopo-loja-insumo-kit.state';
import { delay } from 'rxjs/operators';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { collapseAnimation } from '@aw-shared/animations/collapse';

@Component({
  selector: 'app-del-grupo-item',
  templateUrl: './deli-grupo-item.component.html',
  styleUrls: ['../../definicao-escopo/de-grupo-item/de-grupo-item.component.scss', './deli-grupo-item.component.scss'],
  animations: [fadeOutAnimation(), collapseAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliGrupoItemComponent implements OnInit, OnDestroy {
  constructor(public definicaoEscopoLojaService: DefinicaoEscopoLojaInsumoKitService, private store: Store) {}

  @Select(DefinicaoEscopoLojaInsumoKitState.getGrupoItens)
  _grupoItens$: Observable<GrupoItemKit[]>;
  grupoItens$: Observable<GrupoItemKit[]>;

  @Input('grupoItem')
  set _grupoItem(grupoItem: GrupoItemKit) {
    this.grupoItem = grupoItem;
    if (grupoItem.ativo) {
      this.id = grupoItem.idOrcamentoGrupoItem;
      this.idProperty = 'idOrcamentoGrupoItem';
    } else {
      this.id = grupoItem.idGrupoItem;
      this.idProperty = 'idGrupoItem';
    }
    if (this.complementoControl && !grupoItem.editingProperty.complemento) {
      this.complementoControl.setValue(grupoItem.complemento);
    }
  }
  grupoItem: GrupoItemKit;

  id: number;
  idProperty: GrupoItemKitID;

  editComplementoPosition: ConnectedPosition = {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'top',
  };

  complementoControl: FormControl;

  subs: Subscription[] = [];

  total$: Observable<number>;

  updateComplemento(): void {
    this.subs.push(
      this.store.dispatch(new UpdateGrupoItemComplementoApi(this.id, this.complementoControl.value)).subscribe(() => {
        setTimeout(() => {
          this.setEditing('complemento', false);
        }, 2000);
      })
    );
  }

  updateTag(tag: string): void {
    if (tag === this.grupoItem.tag) return;
    this.definicaoEscopoLojaService.updateGrupoItemTagApi(this.id, tag);
  }

  setEditing(property: KeyofGrupoItemKit, editing: boolean): void {
    this.definicaoEscopoLojaService.setGrupoItemEditing(this.id, property, editing);
  }

  isComplementoEqual({ value }: AbstractControl): ValidationErrors | null {
    return value === this.grupoItem.complemento ? { complementoEqual: true } : null;
  }

  incluirOrExcluir(): void {
    const {
      idGrupoItem,
      classificacao,
      quantidadeTotal,
      idGrupo,
      numeracaoGrupoItem,
      valorUnitarioProdutoReferencia,
      valorUnitarioServicoReferencia,
      descricaoGrupoItem,
      idUnidade,
      unidadeMedida,
      complemento,
      idOrcamentoGrupo,
      tag,
      numeracao,
      ativo,
      idOrcamentoGrupoItem,
    } = this.grupoItem;
    if (ativo) {
      this.definicaoEscopoLojaService.excluirGrupoItemApi(idOrcamentoGrupoItem, idGrupoItem);
    } else {
      this.definicaoEscopoLojaService.incluirGrupoItemApi({
        idGrupoItem,
        classificacao,
        quantidadeTotal,
        idGrupo,
        numeracaoGrupoItem: numeracaoGrupoItem ?? numeracao,
        valorUnitarioProdutoReferencia,
        valorUnitarioServicoReferencia,
        descricaoGrupoItem,
        idUnidade,
        complemento,
        idOrcamentoGrupo: idOrcamentoGrupo ?? this.definicaoEscopoLojaService.grupo.idOrcamentoGrupo,
        idOrcamentoGrupoItem: 0,
        idOrcamentoGrupoItemPai: 0,
        tag,
        UM: {
          descricao: unidadeMedida,
          idUnidadeMedida: idUnidade,
          ativo: true,
        },
        orcamentoGrupoItemQuantitativo: [],
      });
    }
  }

  ngOnInit(): void {
    this.complementoControl = new FormControl(this.grupoItem.complemento, [this.isComplementoEqual.bind(this)]);
    this.total$ = this.store.select(
      DefinicaoEscopoLojaInsumoKitState.getGrupoItemTotal(this.grupoItem.idOrcamentoGrupoItem)
    );
    this.grupoItens$ = this._grupoItens$.pipe(delay(0));
  }

  ngOnDestroy(): void {
    this.subs.filter(Boolean).forEach(sub => sub.unsubscribe());
  }
}
