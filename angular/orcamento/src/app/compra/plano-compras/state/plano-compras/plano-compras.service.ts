import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PlanoComprasStore } from './plano-compras.store';
import {
  KeyofPlanoCompras,
  PcDatasPlanejamentoEnum,
  PcFaturamentoPayload,
  PlanoCompras,
} from '../../models/plano-compras';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, pluck, tap } from 'rxjs/operators';
import { PcResponsabilidadeEnum } from '../../models/pc-responsavel';
import { PcResponsavelStore } from '../responsavel/pc-responsavel.store';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { PcFaturamento } from '../../models/pc-faturamento';
import { PcCabecalhoService } from '../cabecalho/pc-cabecalho.service';
import { ErrorApi } from '../../../../grupo/definicao-escopo/model/error-api';
import { PcFornecedor } from '../../models/pc-fornecedor';
import { arrayAdd, arrayRemove, setLoading } from '@datorama/akita';
import { PlanoComprasQuery } from './plano-compras.query';
import { awCache } from '@aw-utils/akita/akita';
import { PcResponsavelQuery } from '../responsavel/pc-responsavel.query';
import { PcGridService } from '../../pc-grid/pc-grid.service';
import { RowNodeCustom } from '../../util/grid-custom-models';
import { PcAddGruposPayload, PcSelecaoGrupoes } from '../../models/selecao-grupoes';
import { refreshMap } from '@aw-utils/rxjs/operators';
import { ControleComprasService } from '../../../controle-compras/state/controle-compras/controle-compras.service';
import { PlanoCompraQuestao } from '@aw-models/plano-compra-questao';
import { CacheService } from '@aw-services/cache/cache.service';

@Injectable({ providedIn: 'root' })
export class PlanoComprasService {
  constructor(
    private planoComprasStore: PlanoComprasStore,
    private http: HttpClient,
    private pcResponsavelStore: PcResponsavelStore,
    private pcCabecalhoService: PcCabecalhoService,
    private planoComprasQuery: PlanoComprasQuery,
    private pcResponsavelQuery: PcResponsavelQuery,
    private pcGridService: PcGridService,
    private controleComprasService: ControleComprasService,
    private cacheService: CacheService
  ) {}

  private readonly _cache = this.cacheService.createCache();

  private _lastIdOrcamentoCenario: number | undefined;

  _faturamentos$ = new BehaviorSubject<PcFaturamento[]>([]);
  faturamentos$ = this._faturamentos$.asObservable();

  private target = environment.AwApiUrl + 'planos-compra';
  targetCenario = (idOrcamentoCenario: number | string): string =>
    `${this.target}/orcamentos-cenario/${idOrcamentoCenario}`;
  targetPlanoCompraGrupo = (idPlanoCompraGrupo: number | string): string =>
    `${this.target}/planos-compra-grupo/${idPlanoCompraGrupo}`;

  getFaturamentos(): Observable<PcFaturamento[]> {
    return this.http
      .get<{ idOrcamentoCenarioGrupoContrato: number; nome: string }[]>(
        environment.AwApiUrl + 'planilha-vendas-hibrida/ListarContratos'
      )
      .pipe(
        map(faturamentos =>
          faturamentos.map(({ idOrcamentoCenarioGrupoContrato, nome }) => ({
            nome,
            id: idOrcamentoCenarioGrupoContrato,
          }))
        ),
        tap(faturamentos => this._faturamentos$.next(faturamentos))
      );
  }

  getLista(idOrcamentoCenario: number, ignoreCache?: boolean): Observable<PlanoCompras[]> {
    let $request = this.http.get<PlanoCompras[]>(`${this.targetCenario(idOrcamentoCenario)}/lista`).pipe(
      map(lista =>
        lista.map((planoCompra: PlanoCompras) => {
          planoCompra.statusProperty = {};
          planoCompra.errorApi = {};
          planoCompra.id = '' + planoCompra.idPlanoCompraGrupo;
          if (!planoCompra.responsavelBatidaMartelo?.id) {
            planoCompra.responsavelBatidaMartelo = null;
          }
          if (!planoCompra.responsavelEscopo?.id) {
            planoCompra.responsavelEscopo = null;
          }
          if (!planoCompra.responsavelNegociacao?.id) {
            planoCompra.responsavelNegociacao = null;
          }
          if (planoCompra.fornecedoresDNN?.length) {
            // Eu sei, parece estranho, mas o backend manda um array com um item em vez de um objeto :(
            // esse é um otimo comentario :d
            planoCompra.fornecedorOrcadoDNN = planoCompra.fornecedoresDNN[0]?.nomeFantasia;
          }
          return planoCompra;
        })
      ),
      setLoading(this.planoComprasStore),
      tap(lista => {
        this.planoComprasStore.set(lista);
      })
    );
    if (this._lastIdOrcamentoCenario === idOrcamentoCenario && !ignoreCache) {
      $request = $request.pipe(awCache(this.planoComprasQuery));
    } else {
      this._lastIdOrcamentoCenario = idOrcamentoCenario;
    }
    return $request;
  }

  update(id: string, planoCompra: Partial<PlanoCompras>): void {
    this.planoComprasStore.update(id, planoCompra);
  }

  updateStatusProperty(id: string, property: KeyofPlanoCompras, status: AwInputStatus): void {
    this.planoComprasStore.update(id, planoCompra => ({
      ...planoCompra,
      statusProperty: { ...planoCompra.statusProperty, [property]: status },
      errorApi: {
        ...planoCompra.errorApi,
        ...(status === 'completed' || !status ? { [property]: null } : {}),
      },
    }));
  }

  addFornecedor(id: string, fornecedor: PcFornecedor): void {
    this.planoComprasStore.update(id, planoCompras => ({
      ...planoCompras,
      fornecedores: arrayAdd(planoCompras.fornecedores, fornecedor),
    }));
  }

  removeFornecedor(id: string, idOrcamentoGrupoFornecedor: number): void {
    this.planoComprasStore.update(id, planoCompras => ({
      ...planoCompras,
      fornecedores: arrayRemove(
        planoCompras.fornecedores,
        f => f.idOrcamentoGrupoFornecedor === idOrcamentoGrupoFornecedor
      ),
    }));
  }

  updateErrorApi(id: string, property: KeyofPlanoCompras, errorApi: ErrorApi, status?: AwInputStatus): void {
    this.planoComprasStore.update(id, planoCompra => ({
      ...planoCompra,
      errorApi: { ...planoCompra.errorApi, [property]: errorApi },
      statusProperty: {
        ...planoCompra.statusProperty,
        ...(status ? { [property]: status } : {}),
      },
    }));
  }

  handleErrorPut(
    id: string,
    property: KeyofPlanoCompras,
    errorApi: ErrorApi,
    status?: AwInputStatus
  ): (err: any) => Observable<never> {
    return err => {
      this.updateErrorApi(id, property, errorApi, status);
      return throwError(err);
    };
  }

  putResponsavel(
    idPlanoCompraGrupo: number,
    responsabilidade: PcResponsabilidadeEnum,
    idResponsavel: number,
    todosGrupos: boolean,
    columnName: KeyofPlanoCompras
  ): Observable<void> {
    this.pcResponsavelStore.setLoading(true);
    const params = new HttpParams().append('todosGrupos', !!todosGrupos + '');
    return this.http
      .put<void>(
        `${this.targetPlanoCompraGrupo(
          idPlanoCompraGrupo
        )}/atualizacao/responsavel/${idResponsavel}/responsabilidade/${responsabilidade}`,
        undefined,
        { params }
      )
      .pipe(
        tap(() => {
          if (!todosGrupos) {
            return;
          }
          const planoCompra = this.planoComprasQuery.getAll();
          const responsavel = this.pcResponsavelQuery.getEntity(idResponsavel);
          this.planoComprasStore.set(
            planoCompra.map(planoCompras => {
              return {
                ...planoCompras,
                [columnName]: responsavel,
              };
            })
          );
        }),
        finalize(() => {
          this.pcResponsavelStore.setLoading(false);
        })
      );
  }

  putDatas(
    idPlanoCompraGrupo: number[],
    data: Date,
    columnName: KeyofPlanoCompras,
    idOrcamentoCenario: number,
    datasPlanejamentoEnum: PcDatasPlanejamentoEnum
  ): Observable<void> {
    const payload = {
      data,
      dataPlanejamento: datasPlanejamentoEnum,
      idOrcamentoCenario,
      idPlanoCompraGrupo,
    };
    return this.http.put<void>(`${this.target}/planos-compra-grupo/data-planejamento`, payload).pipe(
      tap(() => {
        const planoCompra = this.planoComprasQuery.getAll();
        this.planoComprasStore.set(
          planoCompra.map(planoCompras => {
            if (idPlanoCompraGrupo.includes(planoCompras.idPlanoCompraGrupo) || idOrcamentoCenario > 0) {
              return {
                ...planoCompras,
                [columnName]: data,
              };
            }
            return planoCompras;
          })
        );
      }),
      finalize(() => {})
    );
  }

  putResponsavelArray(
    idPlanoCompraGrupo: number[],
    responsabilidade: PcResponsabilidadeEnum,
    idResponsavel: number | null,
    columnName: KeyofPlanoCompras,
    idOrcamentoCenario: number
  ): Observable<void> {
    this.pcResponsavelStore.setLoading(true);
    const payload = {
      idResponsavel,
      idOrcamentoCenario,
      responsabilidade,
      idPlanoCompraGrupo,
    };
    return this.http.put<void>(`${this.target}/planos-compra-grupo/responsavel`, payload).pipe(
      tap(() => {
        const planoCompra = this.planoComprasQuery.getAll();
        const responsavel = this.pcResponsavelQuery.getEntity(idResponsavel);
        this.planoComprasStore.set(
          planoCompra.map(planoCompras => {
            if (idPlanoCompraGrupo.includes(planoCompras.idPlanoCompraGrupo)) {
              return {
                ...planoCompras,
                [columnName]: responsavel,
              };
            }
            return planoCompras;
          })
        );
      }),
      finalize(() => {
        this.pcResponsavelStore.setLoading(false);
      })
    );
  }

  putComentario(idPlanoCompraGrupo: string, comentario: string): void {
    this.updateStatusProperty(idPlanoCompraGrupo, 'comentario', 'loading');
    this.http
      .put<void>(
        `${this.targetPlanoCompraGrupo(idPlanoCompraGrupo)}/atualizacao/comentario`,
        `\"${comentario}\"`, // .NET things brother, don't ask me
        { headers: new HttpHeaders({ 'Content-type': 'application/json' }) }
      )
      .pipe(
        tap(() => {
          this.updateStatusProperty(idPlanoCompraGrupo, 'comentario', 'completed');
        }),
        catchError(
          this.handleErrorPut(
            idPlanoCompraGrupo,
            'comentario',
            {
              error: 'Erro ao tentar atualziar o comentário!',
              args: [idPlanoCompraGrupo, comentario],
              callAgain: this.putComentario.bind(this),
            },
            'invalid'
          )
        )
      )
      .subscribe();
  }

  putComentarioFornecedores(idPlanoCompraGrupo: string, comentario: string): void {
    this.updateStatusProperty(idPlanoCompraGrupo, 'comentarioFornecedores', 'loading');
    this.http
      .put<void>(
        `${this.targetPlanoCompraGrupo(idPlanoCompraGrupo)}/atualizacao/comentario-fornecedores`,
        `\"${comentario}\"`, // .NET things brother, don't ask me
        { headers: new HttpHeaders({ 'Content-type': 'application/json' }) }
      )
      .pipe(
        tap(() => {
          this.updateStatusProperty(idPlanoCompraGrupo, 'comentarioFornecedores', 'completed');
        }),
        catchError(
          this.handleErrorPut(
            idPlanoCompraGrupo,
            'comentarioFornecedores',
            {
              error: 'Erro ao tentar atualziar o comentário do fornecedor!',
              args: [idPlanoCompraGrupo, comentario],
              callAgain: this.putComentario.bind(this),
            },
            'invalid'
          )
        )
      )
      .subscribe();
  }

  putComentarioMetaCompra(idPlanoCompraGrupo: string, comentario: string, row: RowNodeCustom): void {
    this.updateStatusProperty(idPlanoCompraGrupo, 'comentarioMetaCompra', 'loading');
    this.http
      .put<void>(
        `${this.targetPlanoCompraGrupo(idPlanoCompraGrupo)}/atualizacao/comentario-meta-compra`,
        `\"${comentario}\"`, // .NET things brother, don't ask me
        { headers: new HttpHeaders({ 'Content-type': 'application/json' }) }
      )
      .pipe(
        tap(() => {
          this.updateStatusProperty(idPlanoCompraGrupo, 'comentarioMetaCompra', 'completed');
          this.update(idPlanoCompraGrupo, { comentarioMetaCompra: comentario });
          setTimeout(() => {
            this.pcGridService.api.redrawRows({ rowNodes: [row] });
          }, 0);
        }),
        catchError(
          this.handleErrorPut(
            idPlanoCompraGrupo,
            'comentarioMetaCompra',
            {
              error: 'Erro ao tentar atualziar o comentário!',
              args: [idPlanoCompraGrupo, comentario],
              callAgain: this.putComentario.bind(this),
            },
            'invalid'
          )
        )
      )
      .subscribe();
  }

  putMetaCompra(idOrcamentoCenario: number, idPlanoCompraGrupo: string, valorMeta: number): void {
    this.updateStatusProperty(idPlanoCompraGrupo, 'metaCompra', 'loading');
    this.http
      .put<PcFaturamentoPayload>(
        `${this.targetCenario(
          idOrcamentoCenario
        )}/planos-compra-grupo/${idPlanoCompraGrupo}/atualizacao/valor-meta/${valorMeta}`,
        undefined
      )
      .pipe(
        map(response => {
          if (!response || response?.responseMessage?.erro) {
            throw response.responseMessage.erro;
          }
          return response;
        }),
        tap(response => {
          this.update(idPlanoCompraGrupo, {
            impostoDesenvolvimento: response.valorImpostoDesenvolvimento,
          });
        }),
        pluck('planoCompras'),
        tap(cabecalho => {
          this.updateStatusProperty(idPlanoCompraGrupo, 'metaCompra', 'completed');
          this.pcCabecalhoService.update(cabecalho);
        }),
        catchError(
          this.handleErrorPut(
            idPlanoCompraGrupo,
            'metaCompra',
            {
              callAgain: this.putMetaCompra.bind(this),
              args: [idOrcamentoCenario, idPlanoCompraGrupo, valorMeta],
              error: 'Erro ao tentar atualizar a meta de compra',
            },
            'invalid'
          )
        )
      )
      .subscribe();
  }

  putFaturamento(idOrcamentoCenario: number, idPlanoCompraGrupo: string, idFaturamento: number): void {
    this.updateStatusProperty(idPlanoCompraGrupo, 'faturamentoDesenvolvimento', 'loading');
    this.http
      .put<PcFaturamentoPayload>(
        `${this.targetCenario(
          idOrcamentoCenario
        )}/planos-compra-grupo/${idPlanoCompraGrupo}/atualizacao/faturamento/${idFaturamento}`,
        undefined
      )
      .pipe(
        tap(response => {
          this.updateStatusProperty(idPlanoCompraGrupo, 'faturamentoDesenvolvimento', 'completed');
          this.planoComprasStore.update(idPlanoCompraGrupo, planoCompra => ({
            ...planoCompra,
            impostoDesenvolvimento: response?.valorImpostoDesenvolvimento ?? planoCompra.impostoDesenvolvimento,
          }));
          this.pcCabecalhoService.update(response?.planoCompras ?? {});
        }),
        catchError(
          this.handleErrorPut(
            idPlanoCompraGrupo,
            'faturamentoDesenvolvimento',
            {
              error: 'Erro ao tentar atualizar o faturamento',
              args: [idOrcamentoCenario, idPlanoCompraGrupo, idFaturamento],
              callAgain: this.putFaturamento.bind(this),
            },
            'invalid'
          )
        )
      )
      .subscribe();
  }

  congelar(idOrcamentoCenario: number): Observable<void> {
    return this.http.put<void>(`${this.targetCenario(idOrcamentoCenario)}/atualizacao/congelamento`, undefined).pipe(
      setLoading(this.planoComprasStore),
      tap(() => {
        this.pcCabecalhoService.update({ congelado: true });
      })
    );
  }

  getSelecaoGrupoes(idOrcamentoCenario: number): Observable<PcSelecaoGrupoes> {
    return this.http.get<PcSelecaoGrupoes>(`${this.targetCenario(idOrcamentoCenario)}/selecao-grupos`).pipe(
      map(selecaoGrupoes => {
        return {
          ...selecaoGrupoes,
          grupoes: selecaoGrupoes.grupoes.map(grupao => {
            return {
              ...grupao,
              grupos: grupao.grupos.map(grupos => {
                return { ...grupos, selecionadoPlanoCompras: grupos.selecionado };
              }),
            };
          }),
        };
      })
    );
  }

  addGruposHttp(payload: PcAddGruposPayload): Observable<boolean> {
    return this.http.post<boolean>(`${this.target}/planos-compra-grupo`, payload);
  }

  addGruposApi(payload: PcAddGruposPayload): Observable<boolean> {
    return this.addGruposHttp(payload).pipe(
      refreshMap(updated => (updated ? this.getLista(payload.idOrcamentoCenario, true) : of(null))),
      tap(() => {
        this.controleComprasService.resetCollapses();
      })
    );
  }

  getQuestoes(): Observable<PlanoCompraQuestao[]> {
    return this.http.get<PlanoCompraQuestao[]>(`${this.target}/questoes`).pipe(
      map(planoCompraQuestoes =>
        planoCompraQuestoes.map(planoCompraQuestao => ({ ...planoCompraQuestao, resposta: false }))
      ),
      this._cache.use('plano-compra-questoes')
    );
  }
}
