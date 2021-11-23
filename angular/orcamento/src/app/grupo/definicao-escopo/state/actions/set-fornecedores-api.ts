import { StateContext } from '@ngxs/store';
import { DefinicaoEscopoState } from '../definicao-escopo.state';
import { DefinicaoEscopoStateModel } from '../definicao-escopo.model';
import { NgxsAction } from '@aw-utils/ngxs/ngxs-action.interface';
import { Fornecedor, SituacaoFornecedor } from '../../../../models';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

export class SetFornecedoresApi implements NgxsAction<DefinicaoEscopoStateModel, DefinicaoEscopoState> {
  static readonly type = '[DefinicaoEscopo] SetFornecedores';

  constructor(
    private idOrcamento: number,
    private idOrcamentoGrupo: number,
    private idGrupo: number,
    private situacao: SituacaoFornecedor = SituacaoFornecedor.HOMOLOGADO
  ) {}

  action(
    { patchState }: StateContext<DefinicaoEscopoStateModel>,
    context: DefinicaoEscopoState
  ): Observable<Fornecedor[]> {
    patchState({ loadingFornecedores: true });
    const { situacao, idGrupo, idOrcamento, idOrcamentoGrupo } = this;
    return context.fornecedorService.getFornecedores({ situacao, idOrcamentoGrupo, idOrcamento, idGrupo }).pipe(
      // Essa lista de fornecedores não pode ter fornecedores suspensos ou desomologados
      map(fornecedores => fornecedores.filter(fornecedor => !fornecedor.desomologado && !fornecedor.suspenso)),
      tap(fornecedores => {
        patchState({ fornecedores, loadingFornecedores: false });
      }),
      catchAndThrow(() => {
        patchState({ loadingFornecedores: false });
      })
    );
  }
}
