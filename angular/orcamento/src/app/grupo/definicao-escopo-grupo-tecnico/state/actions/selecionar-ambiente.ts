import { StateContext } from '@ngxs/store';
import { ProjetoAmbienteSelecionarPayload } from '@aw-models/projeto-ambiente';
import { getPaiFilho } from './utils';
import { DefinicaoEscopoGrupoTecnicoState } from '../definicao-escopo-grupo-tecnico.state';
import { DefinicaoEscopoGrupoTecnicoStateModel } from '../definicao-escopo-grupo-tecnico.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { SetGrupoItemFilhosApi } from './set-grupo-item-filhos-api';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { SpkEnum } from '@aw-models/spk';

export class SelecionarAmbiente
  implements NgxsAction<DefinicaoEscopoGrupoTecnicoStateModel, DefinicaoEscopoGrupoTecnicoState> {
  static readonly type = '[DefinicaoEscopoGrupoTecnico] SelecionarAmbiente';

  constructor(
    private idOrcamentoGrupoItemPai: number,
    private idOrcamentoGrupoItem: number,
    private idProjetoEdificioPavimento: number
  ) {}

  action(
    { dispatch, getState }: StateContext<DefinicaoEscopoGrupoTecnicoStateModel>,
    context: DefinicaoEscopoGrupoTecnicoState
  ): Observable<void> {
    const [grupoItemPai, grupoItem] = getPaiFilho(
      getState().grupoItens,
      this.idOrcamentoGrupoItemPai,
      this.idOrcamentoGrupoItem
    );
    if (!grupoItem.ambientesSelecionados?.length) {
      return;
    }
    dispatch(
      new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, { savingAmbientes: true })
    );
    const payload: ProjetoAmbienteSelecionarPayload = grupoItem.ambientesSelecionados.reduce(
      (acc, { idSpk, idProjetoAmbiente, numeroPessoas, area }) => ({
        ...acc,
        idSpk: [...acc.idSpk, `${idProjetoAmbiente}#${idSpk || SpkEnum.sim}`],
        idProjetoAmbiente: [...acc.idProjetoAmbiente, idProjetoAmbiente],
        numeroPessoas,
        areaAndar: area,
      }),
      {
        idOrcamentoGrupoItem: this.idOrcamentoGrupoItem,
        idSpk: [],
        idProjetoAmbiente: [],
        areaAndar: 0,
        numeroPessoas: 0,
        idProjetoEdificioPavimento: this.idProjetoEdificioPavimento,
      } as ProjetoAmbienteSelecionarPayload
    );
    return context.definicaoEscopoGrupoTecnicoService.projetoAmbienteService.selecionarAmbientes(payload).pipe(
      tap(() => {
        dispatch([
          new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, {
            ambientesSelecionados: [],
            savingAmbientes: false,
          }),
          new SetGrupoItemFilhosApi(this.idOrcamentoGrupoItemPai, grupoItemPai.idGrupoItem),
        ]);
      }),
      catchAndThrow(() => {
        dispatch(
          new UpdateGrupoItemFilho(this.idOrcamentoGrupoItemPai, this.idOrcamentoGrupoItem, { savingAmbientes: false })
        );
      })
    );
  }
}
