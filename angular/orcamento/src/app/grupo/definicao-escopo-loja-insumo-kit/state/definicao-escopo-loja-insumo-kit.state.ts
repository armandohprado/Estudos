import { Action, Actions, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitStateModel } from './definicao-escopo-loja-insumo-kit.model';
import { DefinicaoEscopoLojaInsumoKitService } from '../definicao-escopo-loja-insumo-kit.service';
import { DefinocaoEscopoLojaInsumoKitActionsArray } from './actions';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { GrupoItemKit, GrupoItemKitFilhoGrouped, KeyofGrupoItemKit } from '../models/grupo-item';
import { groupBy } from 'lodash-es';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { DeDistribuirQuantitativoService } from '../../definicao-escopo/shared/de-distribuir-quantitativo/de-distribuir-quantitativo.service';
import { Injectable } from '@angular/core';

@State<DefinicaoEscopoLojaInsumoKitStateModel>({
  name: 'definicaoEscopoLojaInsumoKit',
  defaults: {
    grupoItens: [],
  },
})
@Injectable({ providedIn: 'root' })
export class DefinicaoEscopoLojaInsumoKitState {
  constructor(
    public definicaoEscopoLojaInsumoKitService: DefinicaoEscopoLojaInsumoKitService,
    public actions$: Actions,
    public deDistribuirQuantitativoService: DeDistribuirQuantitativoService
  ) {}

  @Selector([DefinicaoEscopoLojaInsumoKitState])
  static getLoading({ loading }: DefinicaoEscopoLojaInsumoKitStateModel): boolean {
    return !!loading;
  }

  @Selector([DefinicaoEscopoLojaInsumoKitState])
  static getErrorApi({ errorApi }: DefinicaoEscopoLojaInsumoKitStateModel): ErrorApi {
    return errorApi;
  }

  @Selector([DefinicaoEscopoLojaInsumoKitState])
  static getGrupoItens({ grupoItens }: DefinicaoEscopoLojaInsumoKitStateModel): GrupoItemKit[] {
    return grupoItens;
  }

  @Selector([DefinicaoEscopoLojaInsumoKitState])
  static getOpeningAll(state: DefinicaoEscopoLojaInsumoKitStateModel): boolean {
    return state.openingAll;
  }

  @Selector([DefinicaoEscopoLojaInsumoKitState])
  static getIsAllOpened(state: DefinicaoEscopoLojaInsumoKitStateModel): boolean {
    return state.grupoItens.filter(grupoItem => grupoItem.ativo).every(grupoItem => grupoItem.opened);
  }

  @Selector([DefinicaoEscopoLojaInsumoKitState])
  static getIsAnyOpened(state: DefinicaoEscopoLojaInsumoKitStateModel): boolean {
    return state.grupoItens.filter(grupoItem => grupoItem.ativo).some(grupoItem => grupoItem.opened);
  }

  static getGrupoItemTotal(idOrcamentoGrupoItem: number): (state: DefinicaoEscopoLojaInsumoKitStateModel) => number {
    return createSelector([DefinicaoEscopoLojaInsumoKitState], ({ grupoItens }) => {
      if (!idOrcamentoGrupoItem || !grupoItens) return 0;
      const grupoItem = grupoItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
      if (!grupoItem || !grupoItem.ativo) return 0;
      if (!grupoItem.filhos?.length) {
        return grupoItem.valorTotal;
      }
      return grupoItem.filhos.reduce((acc, filho) => {
        return acc + filho.quantidade * filho.valorProduto;
      }, 0);
    });
  }

  @Selector([DefinicaoEscopoLojaInsumoKitState])
  static hasAnyGrupoItemInvalid({ grupoItens }: DefinicaoEscopoLojaInsumoKitStateModel): boolean {
    const hasAnyAtivo = grupoItens.some(grupoItem => grupoItem.ativo);
    return (
      !hasAnyAtivo ||
      grupoItens.some(
        grupoItem =>
          grupoItem.loading ||
          grupoItem.quantitativo?.loading ||
          Object.values(grupoItem.statusProperty ?? {}).includes('loading') ||
          (grupoItem.catalogo ?? []).some(kit => kit.loading) ||
          (grupoItem.produtos ?? []).some(kit => kit.loading) ||
          (grupoItem.filhos ?? []).some(
            filho => filho.loading || Object.values(filho.statusProperty ?? {}).includes('loading')
          )
      )
    );
  }

  static getStatusProperty(
    idOrcamentoGrupoItem: number,
    property: KeyofGrupoItemKit
  ): (state: DefinicaoEscopoLojaInsumoKitStateModel) => AwInputStatus {
    return createSelector([DefinicaoEscopoLojaInsumoKitState], state => {
      return state.grupoItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem)?.statusProperty?.[
        property
      ];
    });
  }

  static getGrupoItemFilhosGrouped(
    idOrcamentoGrupoItem: number
  ): (state: DefinicaoEscopoLojaInsumoKitStateModel) => GrupoItemKitFilhoGrouped[] {
    return createSelector([DefinicaoEscopoLojaInsumoKitState], ({ grupoItens }) => {
      const grupoItem = grupoItens.find(gi => gi.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
      const grouped = groupBy(grupoItem.filhos, 'descricaoInsumo');
      return Object.entries(grouped).map(([descricao, itens]) => ({
        descricao,
        itens,
      }));
    });
  }

  @Action(DefinocaoEscopoLojaInsumoKitActionsArray)
  actions(ctx: StateContext<DefinicaoEscopoLojaInsumoKitStateModel>, action: NgxsAction): any {
    return action.action(ctx, this);
  }
}
