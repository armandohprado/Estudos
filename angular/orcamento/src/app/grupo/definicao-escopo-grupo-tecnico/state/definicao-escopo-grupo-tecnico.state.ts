// tslint:disable:max-line-length
import { Action, Actions, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoStateModel } from './definicao-escopo-grupo-tecnico.model';
import { DefinicaoEscopoGrupoTecnicoService } from '../definicao-escopo-grupo-tecnico.service';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { ErrorApi } from '../../definicao-escopo/model/error-api';
import {
  GrupoItemTecnico,
  GrupoItemTecnicoFilho,
  GrupoItemTecnicoFilhoPavimentoAmbiente,
  GrupoItemTecnicoFilhoGrouped,
  KeyofGrupoItemTecnico,
} from '../models/grupo-item';
import { uniqBy } from 'lodash-es';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { DeDistribuirQuantitativoService } from '../../definicao-escopo/shared/de-distribuir-quantitativo/de-distribuir-quantitativo.service';
import { Injectable } from '@angular/core';
import { DefinocaoEscopoGrupoTecnicoActionsArray } from './actions';
import { getPaiFilho } from './actions/utils';
import { Pavimento } from '../../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { hasAnyCentroCustoAtivo } from './actions/delete-ambientes-selecionados-if-no-value';
import { orderBy, OrderByType } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { search } from '@aw-components/aw-utils/aw-search/aw-search.pipe';
import { deGrupoItemFiltro, GrupoItemFiltroEnum } from '../../definicao-escopo/shared/de-grupo-item-filtro.pipe';

// tslint:enable:max-line-length

@State<DefinicaoEscopoGrupoTecnicoStateModel>({
  name: 'definicaoEscopoGrupoTecnico',
  defaults: {
    grupoItens: [],
  },
})
@Injectable({ providedIn: 'root' })
export class DefinicaoEscopoGrupoTecnicoState {
  constructor(
    public definicaoEscopoGrupoTecnicoService: DefinicaoEscopoGrupoTecnicoService,
    public actions$: Actions,
    public deDistribuirQuantitativoService: DeDistribuirQuantitativoService
  ) {}

  @Selector([DefinicaoEscopoGrupoTecnicoState])
  static getLoading({ loading }: DefinicaoEscopoGrupoTecnicoStateModel): boolean {
    return !!loading;
  }

  @Selector([DefinicaoEscopoGrupoTecnicoState])
  static getErrorApi({ errorApi }: DefinicaoEscopoGrupoTecnicoStateModel): ErrorApi {
    return errorApi;
  }

  @Selector([DefinicaoEscopoGrupoTecnicoState])
  static getGrupoItens({ grupoItens }: DefinicaoEscopoGrupoTecnicoStateModel): GrupoItemTecnico[] {
    return grupoItens;
  }

  @Selector([DefinicaoEscopoGrupoTecnicoState])
  static getOpeningAll(state: DefinicaoEscopoGrupoTecnicoStateModel): boolean {
    return state.openingAll;
  }

  @Selector([DefinicaoEscopoGrupoTecnicoState])
  static getIsAllOpened(state: DefinicaoEscopoGrupoTecnicoStateModel): boolean {
    return state.grupoItens.filter(grupoItem => grupoItem.ativo).every(grupoItem => grupoItem.opened);
  }

  @Selector([DefinicaoEscopoGrupoTecnicoState])
  static getIsAnyOpened(state: DefinicaoEscopoGrupoTecnicoStateModel): boolean {
    return state.grupoItens.filter(grupoItem => grupoItem.ativo).some(grupoItem => grupoItem.opened);
  }

  static getGrupoItensFiltered(
    order: OrderByType<GrupoItemTecnico>,
    filter: GrupoItemFiltroEnum,
    term?: string
  ): (state: DefinicaoEscopoGrupoTecnicoStateModel) => GrupoItemTecnico[] {
    return createSelector([DefinicaoEscopoGrupoTecnicoState], ({ grupoItens }) => {
      return orderBy(
        search(
          deGrupoItemFiltro(grupoItens, filter),
          ['numeracao', 'numeracaoGrupoItem', 'descricaoGrupoItem', 'tag'],
          term
        ),
        order
      );
    });
  }

  static getGrupoItemFilho(
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number
  ): (state: DefinicaoEscopoGrupoTecnicoStateModel) => GrupoItemTecnicoFilho {
    return createSelector([DefinicaoEscopoGrupoTecnicoState], ({ grupoItens }) => {
      const [, grupoItem] = getPaiFilho(grupoItens, idOrcamentoGrupoItemPai, idOrcamentoGrupoItem);
      return grupoItem;
    });
  }

  static getGrupoItemTotal(idOrcamentoGrupoItem: number): (state: DefinicaoEscopoGrupoTecnicoStateModel) => number {
    return createSelector([DefinicaoEscopoGrupoTecnicoState], ({ grupoItens }) => {
      if (!idOrcamentoGrupoItem || !grupoItens) {
        return 0;
      }
      const grupoItem = grupoItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
      if (!grupoItem || !grupoItem.ativo) {
        return 0;
      }
      if (!grupoItem.filhos?.length) {
        return grupoItem.valorUnitarioProdutoReferencia;
      } else {
        return grupoItem.filhos.reduce((acc, filho) => acc + filho.quantidade * filho.valorProduto, 0);
      }
    });
  }

  @Selector([DefinicaoEscopoGrupoTecnicoState])
  static hasAnyGrupoItemInvalid({ grupoItens }: DefinicaoEscopoGrupoTecnicoStateModel): boolean {
    // TODO implement
    return false;
  }

  static getStatusProperty(
    idOrcamentoGrupoItem: number,
    property: KeyofGrupoItemTecnico
  ): (state: DefinicaoEscopoGrupoTecnicoStateModel) => AwInputStatus {
    return createSelector([DefinicaoEscopoGrupoTecnicoState], state => {
      return state.grupoItens.find(item => item.idOrcamentoGrupoItem === idOrcamentoGrupoItem)?.statusProperty?.[
        property
      ];
    });
  }

  static getGrupoItemFilhosGrouped(
    idOrcamentoGrupoItem: number
  ): (state: DefinicaoEscopoGrupoTecnicoStateModel) => GrupoItemTecnicoFilhoGrouped[] {
    return createSelector([DefinicaoEscopoGrupoTecnicoState], ({ grupoItens }) => {
      const grupoItem = grupoItens.find(gi => gi.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
      return orderBy(
        uniqBy(
          grupoItem.filhos.map(filho => ({ descricao: filho.descricaoInsumo, ordem: filho.ordem, itens: [] })),
          'descricao'
        ).map(grupo => ({
          ...grupo,
          itens: grupoItem.filhos.filter(gi => gi.descricaoInsumo === grupo.descricao),
        })),
        'ordem'
      );
    });
  }

  static selectAmbientes(
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idProjetoEdificioPavimento?: number
  ): (state: DefinicaoEscopoGrupoTecnicoStateModel) => GrupoItemTecnicoFilhoPavimentoAmbiente[] {
    return createSelector([DefinicaoEscopoGrupoTecnicoState], ({ grupoItens }) => {
      const [, grupoItem] = getPaiFilho(grupoItens, idOrcamentoGrupoItemPai, idOrcamentoGrupoItem);
      let ambientes = grupoItem.ambientesSelecionados ?? [];
      if (idProjetoEdificioPavimento) {
        ambientes = ambientes.filter(ambiente => ambiente.idProjetoEdificioPavimento === idProjetoEdificioPavimento);
      }
      return ambientes;
    });
  }

  static selectPavimentos(
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number
  ): (state: DefinicaoEscopoGrupoTecnicoStateModel) => Pavimento[] {
    return createSelector([DefinicaoEscopoGrupoTecnicoState], ({ grupoItens }) => {
      const [, grupoItem] = getPaiFilho(grupoItens, idOrcamentoGrupoItemPai, idOrcamentoGrupoItem);
      if (!grupoItem?.quantitativo || !grupoItem.quantitativo.fases.length) {
        return [];
      }
      const [firstFase] = grupoItem.quantitativo.fases;
      return firstFase.edificios
        .reduce((acc: Pavimento[], edificio) => {
          acc.push(edificio, ...(edificio.andares ?? []));
          if (edificio.site) {
            acc.push(edificio.site);
          }
          return acc;
        }, [])
        .filter(pavimento => hasAnyCentroCustoAtivo(grupoItem.quantitativo.fases, pavimento));
    });
  }

  @Action(DefinocaoEscopoGrupoTecnicoActionsArray)
  actions(ctx: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>, action: NgxsAction): any {
    return action.action(ctx, this);
  }
}
