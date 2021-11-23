import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { StateContext } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UpdateGrupoItem } from './update-grupo-item';
import { finalize, tap } from 'rxjs/operators';
import { RefreshNumeracaoApi } from './refresh-numeracao-api';
import { GenericResponse } from '../../model/generic-response';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

export class ExcluirGrupoItemApi implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] ExlcuirGrupoItemApi';
  constructor(public idOrcamentoGrupoItem: number, public forcarExclusao = false) {}

  action(
    { setState, dispatch, getState }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<void> {
    dispatch(new UpdateGrupoItem(this.idOrcamentoGrupoItem, { loading: true }));
    const grupoItem = getState().gruposItens.find(o => o.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    return context.definicaoEscopoService
      .excluirGrupoItem(
        this.idOrcamentoGrupoItem,
        context.definicaoEscopoService.idOrcamentoCenario,
        this.forcarExclusao
      )
      .pipe(
        tap(() => {
          dispatch([
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
              loading: false,
              idOrcamentoGrupoItem: 0,
              valorUnitarioProdutoReferencia: null,
              complemento: '',
              numeracaoGrupoItem: null,
              numeracao: grupoItem.numeracao || grupoItem.numeracaoGrupoItem,
              valorUnitarioServicoReferencia: null,
              tag: '',
              ativo: false,
              quantidadeTotal: null,
              quantitativo: null,
              errorApi: null,
              atributos: null,
              atributo1: null,
              atributo2: null,
              atributo3: null,
              atributo4: null,
              activeMode: null,
              opened: false,
              activeTab: null,
              duplicarLoading: false,
              valorTotal: null,
              fornecedores: [],
              idsFornecedores: [],
            }),
            new RefreshNumeracaoApi(grupoItem.idOrcamentoGrupo),
          ]);
        }),
        catchAndThrow((response: GenericResponse) => {
          dispatch(
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
              loading: false,
              ativo: false,
            })
          );
          setTimeout(() => {
            dispatch(
              new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
                ativo: true,
              })
            );
          });
          if (response.codigo === 2) {
            context.definicaoEscopoService.awDialogService.warning({
              title: 'Atenção',
              content: response.mensagem,
              primaryBtn: {
                title: 'Excluir',
                action: bsModalRef =>
                  context.definicaoEscopoService.store
                    .dispatch(new ExcluirGrupoItemApi(this.idOrcamentoGrupoItem, true))
                    .pipe(
                      finalize(() => {
                        bsModalRef.hide();
                      })
                    ),
              },
              bsModalOptions: { ignoreBackdropClick: true },
            });
          }
        })
      );
  }
}
