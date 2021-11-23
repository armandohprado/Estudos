import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable } from 'rxjs';
import { Quantitativo } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';
import { finalize, tap } from 'rxjs/operators';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';

export class SetGrupoItemFilhoQuantitativoApi
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState>
{
  static readonly type = '[DefinicaoEscopoGrupoTecnico] SetGrupoItemFilhoQuantitativoApi';

  constructor(public idOrcamentoGrupoItemPai: number, public idOrcamentoGrupoItem: number) {}

  action(
    { dispatch }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    { definicaoEscopoGrupoTecnicoService }: DefinicaoEscopoGrupoTecnicoState
  ): Observable<Quantitativo> {
    dispatch(
      new UpdateGrupoItemFilho(this.idOrcamentoGrupoItem, this.idOrcamentoGrupoItem, { quantitativoLoading: true })
    );
    return definicaoEscopoGrupoTecnicoService.definicaoEscopoService
      .getQuantitativo(definicaoEscopoGrupoTecnicoService.grupo.idOrcamento, this.idOrcamentoGrupoItem)
      .pipe(
        tap(quantitativo => {
          dispatch(new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, { quantitativo }));
        }),
        finalize(() => {
          dispatch(
            new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, {
              quantitativoLoading: false,
            })
          );
        })
      );
  }
}
