import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { UpdateGrupoItem } from './update-grupo-item';
import { patch, removeItem } from '@ngxs/store/operators';
import { GrupoItemTecnico } from '../../models/grupo-item';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { GenericResponse } from '../../../definicao-escopo/model/generic-response';

export class ExcluirGrupoItemFilhoApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState>
{
  static readonly type = '[DefinicaoEscopoGrupoTecnico] ExcluirGrupoItemFilhoApi';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private forcarExclusao = false
  ) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): Observable<void> {
    dispatch(new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, { loading: true }));
    return context.definicaoEscopoGrupoTecnicoService.definicaoEscopoService
      .excluirGrupoItem(
        this.idOrcamentoGrupoItem,
        context.definicaoEscopoGrupoTecnicoService.idOrcamentoCenario,
        this.forcarExclusao
      )
      .pipe(
        tap(() => {
          dispatch(
            new UpdateGrupoItem(
              this.idOrcamentoGrupoItemPai,
              patch<GrupoItemTecnico>({
                filhos: removeItem(filho => filho.idOrcamentoGrupoItem === this.idOrcamentoGrupoItem),
              })
            )
          );
        }),
        finalize(() => {
          dispatch(
            new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, { loading: false })
          );
        }),
        catchAndThrow((response: GenericResponse) => {
          if (response.codigo === 2) {
            context.definicaoEscopoGrupoTecnicoService.definicaoEscopoService.awDialogService.warning({
              title: 'Atenção',
              content: response.mensagem,
              primaryBtn: {
                title: 'Excluir',
                action: bsModalRef =>
                  context.definicaoEscopoGrupoTecnicoService.definicaoEscopoService.store
                    .dispatch(
                      new ExcluirGrupoItemFilhoApi(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, true)
                    )
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
