import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { SetGrupoItemLoading } from './set-grupo-item-loading';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UpdateGrupoItem } from './update-grupo-item';
import { SetGrupoItensApi } from './set-grupo-itens-api';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';

export class ExcluirGrupoItemApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState>
{
  static readonly type = '[DefinicaoEscopoGrupoTecnico] ExcluirGrupoItemApi';

  constructor(public idOrcamentoGrupoItem: number, public idGrupoItem: number, public forcarExclusao = false) {}

  action(
    { setState, dispatch, getState }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    { definicaoEscopoGrupoTecnicoService }: DefinicaoEscopoGrupoTecnicoState
  ): Observable<void> {
    const grupo = getState().grupoItens.find(g => g.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem);
    dispatch(new SetGrupoItemLoading(this.idOrcamentoGrupoItem, true));
    return definicaoEscopoGrupoTecnicoService.definicaoEscopoLojaInsumoService
      .excluirGrupoItem(
        this.idOrcamentoGrupoItem,
        definicaoEscopoGrupoTecnicoService.idOrcamentoCenario,
        this.forcarExclusao
      )
      .pipe(
        finalize(() => {
          dispatch([
            new UpdateGrupoItem(this.idOrcamentoGrupoItem, {
              loading: false,
              errorApi: null,
              statusProperty: {},
              editingProperty: {},
              opened: false,
              ativo: false,
            }),
            new SetGrupoItensApi(grupo.idOrcamentoGrupo),
          ]);
        }),
        catchAndThrow((response: GenericResponse) => {
          if (response.codigo === 2) {
            definicaoEscopoGrupoTecnicoService.definicaoEscopoService.awDialogService.warning({
              title: 'Atenção',
              content: response.mensagem,
              primaryBtn: {
                title: 'Excluir',
                action: bsModalRef =>
                  definicaoEscopoGrupoTecnicoService.definicaoEscopoService.store
                    .dispatch(new ExcluirGrupoItemApi(this.idOrcamentoGrupoItem, this.idGrupoItem, true))
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
