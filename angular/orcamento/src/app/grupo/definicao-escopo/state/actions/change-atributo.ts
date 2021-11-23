import { StateContext, StateOperator } from '@ngxs/store';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import {
  GrupoComboConteudo,
  GrupoItemAtributo,
  GrupoItemDadoAtributo,
  GrupoItemDadoAtributoCombo,
} from '../../model/grupo-item-atributo';
import { GrupoItemDE } from '../../model/grupo-item';
import { DefinicaoEscopoService } from '../../definicao-escopo.service';
import { forkJoin, Observable, of } from 'rxjs';
import { GenericResponse } from '../../model/generic-response';
import { UpdateGrupoItem } from './update-grupo-item';
import { patch, updateItem } from '@ngxs/store/operators';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { Predicate } from '@ngxs/store/operators/internals';
import { isFunction } from 'lodash-es';

export class ChangeAtributo implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] ChangeAtributo';

  constructor(
    private idOrcamentoGrupoItem: number,
    private grupoItemAtributo: GrupoItemAtributo,
    private grupoItemDadoAtributo: GrupoItemDadoAtributo,
    private grupoItemDadoAtributoCombo?: GrupoItemDadoAtributoCombo,
    private grupoComboConteudo?: GrupoComboConteudo
  ) {}

  definicaoEscopoState: DefinicaoEscopoState;
  definicaoEscopoService: DefinicaoEscopoService;
  context: StateContext<DefinicaoEscopoStateModel>;

  get grupoItem(): GrupoItemDE {
    return this.context.getState().gruposItens.find(gi => gi.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
  }

  get grupoItemDadoAtributos(): GrupoItemDadoAtributo[] | undefined {
    return this.grupoItem.atributos.find(attr => attr.ordem === this.grupoItemAtributo.ordem)?.grupoItemDadoAtributo;
  }

  action(
    stateContext: StateContext<DefinicaoEscopoStateModel>,
    definicaoEscopoState: DefinicaoEscopoState
  ): Observable<GenericResponse> {
    this.definicaoEscopoState = definicaoEscopoState;
    this.definicaoEscopoService = this.definicaoEscopoState.definicaoEscopoService;
    this.context = stateContext;
    this.updateGrupoItemAtributo(
      this.grupoItemAtributo.ordem,
      patch({
        loading: true,
      })
    );
    let http$: Observable<GenericResponse>;
    if (this.grupoComboConteudo) {
      http$ = this.grupoComboConteudoHandler();
    } else {
      http$ = this.grupoItemDadoAtributoHandler();
    }
    return http$.pipe(
      finalize(() => {
        this.updateGrupoItemAtributo(
          this.grupoItemAtributo.ordem,
          patch({
            loading: false,
          })
        );
      })
    );
  }

  excluirGrupoItemDadoAtributoAtivo(): Observable<GenericResponse[] | null> {
    const grupoItemDadoAtributoAtivo = this.grupoItemDadoAtributos?.filter(gida => gida.ativo);
    if (grupoItemDadoAtributoAtivo?.length) {
      const ids = grupoItemDadoAtributoAtivo.map(gida => gida.idOrcamentoGrupoItemAtributo);
      return forkJoin(
        ids.map(idOrcamentoGrupoItemAtributo =>
          this.definicaoEscopoService.excluirGrupoItemAtributo(idOrcamentoGrupoItemAtributo)
        )
      ).pipe(
        tap(() => {
          this.updateGrupoItemDadoAtributo(
            this.grupoItemAtributo.ordem,
            gida => ids.includes(gida.idOrcamentoGrupoItemAtributo),
            patch<GrupoItemDadoAtributo>({
              idOrcamentoGrupoItemAtributo: 0,
              ativo: false,
              grupoItemDadoAtributoCombo: gidacs =>
                (gidacs ?? []).map(gidac => ({
                  ...gidac,
                  idOrcamentoGrupoItemAtributoCombo: 0,
                  ativo: false,
                  grupoComboConteudo: (gidac.grupoComboConteudo ?? []).map(gcc => ({
                    ...gcc,
                    ativo: false,
                  })),
                })),
            })
          );
        })
      );
    } else {
      return of(null);
    }
  }

  grupoItemDadoAtributoHandler(): Observable<GenericResponse> {
    if (this.grupoItemDadoAtributo.ativo) {
      return this.definicaoEscopoService
        .excluirGrupoItemAtributo(this.grupoItemDadoAtributo.idOrcamentoGrupoItemAtributo)
        .pipe(
          tap(() => {
            this.updateGrupoItemDadoAtributo(
              this.grupoItemAtributo.ordem,
              this.grupoItemDadoAtributo.idGrupoItemDadoAtributo,
              patch<GrupoItemDadoAtributo>({
                idOrcamentoGrupoItemAtributo: 0,
                ativo: false,
                grupoItemDadoAtributoCombo: grupoItemDadoAtributoCombo =>
                  (grupoItemDadoAtributoCombo ?? []).map(gidac => ({
                    ...gidac,
                    idOrcamentoGrupoItemAtributoCombo: 0,
                    ativo: false,
                    grupoComboConteudo: (gidac.grupoComboConteudo ?? []).map(gcc => ({ ...gcc, ativo: false })),
                  })),
              })
            );
          })
        );
    } else {
      return this.excluirGrupoItemDadoAtributoAtivo().pipe(
        switchMap(() => {
          return this.definicaoEscopoService
            .incluirGrupoItemDadoAtributo({
              idOrcamentoGrupoItem: this.grupoItemDadoAtributo.idOrcamentoGrupoItem,
              idGrupoItemDadoAtributo: this.grupoItemDadoAtributo.idGrupoItemDadoAtributo,
              idOrcamentoGrupoItemAtributo: 0,
              ordem: this.grupoItemAtributo.ordem,
              descricao: this.grupoItemDadoAtributo.descricaoGrupoItemDadoAtributo,
            })
            .pipe(
              tap(response => {
                this.updateGrupoItemDadoAtributo(
                  this.grupoItemAtributo.ordem,
                  this.grupoItemDadoAtributo.idGrupoItemDadoAtributo,
                  patch({
                    idOrcamentoGrupoItemAtributo: response.codigo,
                    ativo: true,
                  })
                );
              })
            );
        })
      );
    }
  }

  grupoItemDadoAtributoComboHandler(): Observable<GrupoItemDadoAtributoCombo> {
    if (this.grupoItemDadoAtributoCombo.ativo) {
      return of(this.grupoItemDadoAtributoCombo);
    } else {
      return this.definicaoEscopoService
        .incluirGrupoItemDadoAtributoCombo({
          idGrupoItemDadoAtributoCombo: this.grupoItemDadoAtributoCombo.idGrupoItemDadoAtributoCombo,
          idOrcamentoGrupoItemAtributo: this.grupoItemDadoAtributo.idOrcamentoGrupoItemAtributo,
          idOrcamentoGrupoItemAtributoCombo: 0,
          ordem: this.grupoItemAtributo.ordem,
          descricaoAtributoCombo: this.grupoItemDadoAtributoCombo.texto,
        })
        .pipe(
          map(response => {
            const newGrupoItemDadoAtributoCombo: GrupoItemDadoAtributoCombo = {
              ...this.grupoItemDadoAtributoCombo,
              idOrcamentoGrupoItemAtributoCombo: response.codigo,
              ativo: true,
            };
            return newGrupoItemDadoAtributoCombo;
          }),
          tap(grupoItemDadoAtributoCombo => {
            this.updateGrupoItemDadoAtributoCombo(
              this.grupoItemAtributo.ordem,
              this.grupoItemDadoAtributo.idGrupoItemDadoAtributo,
              grupoItemDadoAtributoCombo.idGrupoItemDadoAtributoCombo,
              patch(grupoItemDadoAtributoCombo)
            );
          })
        );
    }
  }

  excluirGrupoComboConteudoAtivo(): void {
    if (!this.grupoComboConteudo.ativo) {
      const grupoComboConteudoAtivo = this.grupoItemDadoAtributos
        ?.find(gida => gida.idGrupoItemDadoAtributo === this.grupoItemDadoAtributo.idGrupoItemDadoAtributo)
        ?.grupoItemDadoAtributoCombo.find(
          gidac => gidac.idGrupoItemDadoAtributoCombo === this.grupoItemDadoAtributoCombo.idGrupoItemDadoAtributoCombo
        )
        ?.grupoComboConteudo.find(gcc => gcc.ativo);
      if (grupoComboConteudoAtivo) {
        this.updateGrupoComboConteudo(
          this.grupoItemAtributo.ordem,
          this.grupoItemDadoAtributo.idGrupoItemDadoAtributo,
          this.grupoItemDadoAtributoCombo.idGrupoItemDadoAtributoCombo,
          grupoComboConteudoAtivo.idGrupoComboConteudo,
          patch({ ativo: false })
        );
      }
    }
  }

  getDescricaoGrupoItemDadoAtributoCombo(excludeIdGrupoCombo = 0, includeIdGrupoCombo = 0): string {
    return this.grupoItemDadoAtributos
      ?.find(gida => gida.idGrupoItemDadoAtributo === this.grupoItemDadoAtributo.idGrupoItemDadoAtributo)
      ?.grupoItemDadoAtributoCombo.reduce((gidacAcc, gidac) => {
        if (gidac.ativo) {
          const textGcc = gidac.grupoComboConteudo.reduce((accGcc, gcc) => {
            if (
              (gcc.ativo || includeIdGrupoCombo === gcc.idGrupoComboConteudo) &&
              gcc.idGrupoComboConteudo !== excludeIdGrupoCombo
            ) {
              accGcc += ` ${gcc.descricaoCategoriaConteudo}`;
            }
            return accGcc;
          }, ' ');
          gidacAcc += ` ${gidac.texto} ${textGcc}`;
        }
        return gidacAcc;
      }, '');
  }

  grupoComboConteudoHandler(): Observable<GenericResponse> {
    if (this.grupoComboConteudo.ativo) {
      return this.definicaoEscopoService
        .atualizacaoGrupoItemDadoAtributoCombo(this.grupoItemDadoAtributoCombo.idOrcamentoGrupoItemAtributoCombo, {
          idOrcamentoGrupoItemAtributo: this.grupoItemDadoAtributo.idOrcamentoGrupoItemAtributo,
          ordem: this.grupoItemAtributo.ordem,
          descricaoAtributoCombo: this.getDescricaoGrupoItemDadoAtributoCombo(
            this.grupoComboConteudo.idGrupoComboConteudo
          ),
          idOrcamentoGrupoItemAtributoCombo: this.grupoItemDadoAtributoCombo.idOrcamentoGrupoItemAtributoCombo,
          idGrupoItemDadoAtributoCombo: this.grupoItemDadoAtributoCombo.idGrupoItemDadoAtributoCombo,
          idGrupoComboConteudo: null,
        })
        .pipe(
          tap(() => {
            this.updateGrupoComboConteudo(
              this.grupoItemAtributo.ordem,
              this.grupoItemDadoAtributo.idGrupoItemDadoAtributo,
              this.grupoItemDadoAtributoCombo.idGrupoItemDadoAtributoCombo,
              this.grupoComboConteudo.idGrupoComboConteudo,
              patch({
                ativo: false,
              })
            );
          })
        );
    } else {
      const grupoItemDadoAtributoCombo$ = this.grupoItemDadoAtributoComboHandler();
      return grupoItemDadoAtributoCombo$.pipe(
        switchMap(grupoItemDadoAtributoCombo => {
          return this.definicaoEscopoService
            .atualizacaoGrupoItemDadoAtributoCombo(grupoItemDadoAtributoCombo.idOrcamentoGrupoItemAtributoCombo, {
              idGrupoComboConteudo: this.grupoComboConteudo.idGrupoComboConteudo,
              idGrupoItemDadoAtributoCombo: grupoItemDadoAtributoCombo.idGrupoItemDadoAtributoCombo,
              idOrcamentoGrupoItemAtributo: this.grupoItemDadoAtributo.idOrcamentoGrupoItemAtributo,
              idOrcamentoGrupoItemAtributoCombo: grupoItemDadoAtributoCombo.idOrcamentoGrupoItemAtributoCombo,
              ordem: this.grupoItemAtributo.ordem,
              descricaoAtributoCombo: this.getDescricaoGrupoItemDadoAtributoCombo(
                0,
                this.grupoComboConteudo.idGrupoComboConteudo
              ),
              descricaoComboConteudo: '',
            })
            .pipe(
              tap(() => {
                this.excluirGrupoComboConteudoAtivo();
                this.updateGrupoComboConteudo(
                  this.grupoItemAtributo.ordem,
                  this.grupoItemDadoAtributo.idGrupoItemDadoAtributo,
                  this.grupoItemDadoAtributoCombo.idGrupoItemDadoAtributoCombo,
                  this.grupoComboConteudo.idGrupoComboConteudo,
                  patch({
                    ativo: true,
                  })
                );
              })
            );
        })
      );
    }
  }

  updateGrupoItemAtributo(ordem: number, operator: StateOperator<GrupoItemAtributo>): void {
    this.context.dispatch(
      new UpdateGrupoItem(
        this.idOrcamentoGrupoItem,
        patch<GrupoItemDE>({
          atributos: updateItem(gia => gia.ordem === ordem, operator),
        })
      )
    );
  }

  updateGrupoItemDadoAtributo(
    ordem: number,
    idGrupoItemDadoAtributo: number | Predicate<GrupoItemDadoAtributo>,
    operator: StateOperator<GrupoItemDadoAtributo>
  ): void {
    const callback: Predicate<GrupoItemDadoAtributo> = isFunction(idGrupoItemDadoAtributo)
      ? idGrupoItemDadoAtributo
      : gida => gida.idGrupoItemDadoAtributo === idGrupoItemDadoAtributo;
    this.updateGrupoItemAtributo(
      ordem,
      patch({
        grupoItemDadoAtributo: updateItem(callback, operator),
      })
    );
  }

  updateGrupoItemDadoAtributoCombo(
    ordem: number,
    idGrupoItemDadoAtributo: number | Predicate<GrupoItemDadoAtributo>,
    idGrupoItemDadoAtributoCombo: number | Predicate<GrupoItemDadoAtributoCombo>,
    operator: StateOperator<GrupoItemDadoAtributoCombo>
  ): void {
    const callback: Predicate<GrupoItemDadoAtributoCombo> = isFunction(idGrupoItemDadoAtributoCombo)
      ? idGrupoItemDadoAtributoCombo
      : gida => gida.idGrupoItemDadoAtributoCombo === idGrupoItemDadoAtributoCombo;
    this.updateGrupoItemDadoAtributo(
      ordem,
      idGrupoItemDadoAtributo,
      patch({
        grupoItemDadoAtributoCombo: updateItem(callback, operator),
      })
    );
  }

  updateGrupoComboConteudo(
    ordem: number,
    idGrupoItemDadoAtributo: number | Predicate<GrupoItemDadoAtributo>,
    idGrupoItemDadoAtributoCombo: number | Predicate<GrupoItemDadoAtributoCombo>,
    idGrupoComboConteudo: number | Predicate<GrupoComboConteudo>,
    operator: StateOperator<GrupoComboConteudo>
  ): void {
    const callback: Predicate<GrupoComboConteudo> = isFunction(idGrupoComboConteudo)
      ? idGrupoComboConteudo
      : gida => gida.idGrupoComboConteudo === idGrupoComboConteudo;
    this.updateGrupoItemDadoAtributoCombo(
      ordem,
      idGrupoItemDadoAtributo,
      idGrupoItemDadoAtributoCombo,
      patch({
        grupoComboConteudo: updateItem(callback, operator),
      })
    );
  }
}
