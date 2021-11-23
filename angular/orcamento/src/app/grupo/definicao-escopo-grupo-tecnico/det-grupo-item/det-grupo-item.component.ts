import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GrupoItemTecnico, GrupoItemTecnicoID, KeyofGrupoItemTecnico } from '../models/grupo-item';
import { DefinicaoEscopoGrupoTecnicoService } from '../definicao-escopo-grupo-tecnico.service';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UpdateGrupoItemComplementoApi } from '../state/actions/update-grupo-item-complemento-api';
import { DefinicaoEscopoGrupoTecnicoState } from '../state/definicao-escopo-grupo-tecnico.state';
import { delay, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { collapseAnimation } from '@aw-shared/animations/collapse';

@Component({
  selector: 'app-del-grupo-item',
  templateUrl: './det-grupo-item.component.html',
  styleUrls: ['../../definicao-escopo/de-grupo-item/de-grupo-item.component.scss', './det-grupo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeOutAnimation(), collapseAnimation()],
})
export class DetGrupoItemComponent implements OnInit, OnDestroy {
  constructor(public definicaoEscopoLojaService: DefinicaoEscopoGrupoTecnicoService, private store: Store) {}

  private _destroy$ = new Subject<void>();

  @Select(DefinicaoEscopoGrupoTecnicoState.getGrupoItens)
  _grupoItens$: Observable<GrupoItemTecnico[]>;
  grupoItens$: Observable<GrupoItemTecnico[]>;

  @Input('grupoItem')
  set _grupoItem(grupoItem: GrupoItemTecnico) {
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
    this.idOrcamentoGrupoItem$.next(grupoItem.idOrcamentoGrupoItem);
  }
  grupoItem: GrupoItemTecnico;

  idOrcamentoGrupoItem$ = new BehaviorSubject<number>(0);
  id: number;
  idProperty: GrupoItemTecnicoID;

  editComplementoPosition: ConnectedPosition = {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'top',
  };

  complementoControl: FormControl;

  total$: Observable<number>;

  updateComplemento(): void {
    this.store
      .dispatch(new UpdateGrupoItemComplementoApi(this.id, this.complementoControl.value))
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        setTimeout(() => {
          this.setEditing('complemento', false);
        }, 2000);
      });
  }

  updateTag(tag: string): void {
    if (tag === this.grupoItem.tag) {
      return;
    }
    this.definicaoEscopoLojaService.updateGrupoItemTagApi(this.id, tag);
  }

  setEditing(property: KeyofGrupoItemTecnico, editing: boolean): void {
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
    this.total$ = this.idOrcamentoGrupoItem$.pipe(
      distinctUntilChanged(),
      switchMap(idOrcamentoGrupoItem =>
        this.store.select(DefinicaoEscopoGrupoTecnicoState.getGrupoItemTotal(idOrcamentoGrupoItem))
      )
    );
    this.grupoItens$ = this._grupoItens$.pipe(delay(0));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
