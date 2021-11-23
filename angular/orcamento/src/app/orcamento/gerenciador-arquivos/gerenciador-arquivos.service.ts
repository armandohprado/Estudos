import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AwHttpParams } from '@aw-utils/http-params';
import { finalize, map, pluck, tap } from 'rxjs/operators';
import { GaAnexoAvulsoStore } from './state/anexo-avulso/ga-anexo-avulso.store';
import { GaPavimentoStore } from './state/pavimento/ga-pavimento.store';
import { GaEtapaStore } from './state/etapa/ga-etapa.store';
import { GaArquivoExtensao } from './model/arquivo-extensao';
import { GaAndar, GaEdificio, GaSite, PavimentoType } from './model/pavimento';
import { GaAtividadeStore, getAtividadeId } from './state/atividade/ga-atividade.store';
import { replaceNullWithUndefined } from '@aw-utils/util';
import { catchAndThrow, refresh, refreshMap, uniqByOperator } from '@aw-utils/rxjs/operators';
import { createIdAtividade, GaAtividadeQuery } from './state/atividade/ga-atividade.query';
import { GaArquivo, GaArquivoGrupo, GaArquivoVersao, GaArquivoVersaoInfo, GaAtividade } from './model/atividade';
import { isFunction } from 'lodash-es';
import { arrayRemove, arrayUpdate } from '@datorama/akita';
import { GaArquivoSuperar } from './model/arquivo-superar';
import { GaEtapaQuery } from './state/etapa/ga-etapa.query';
import { GaFamilia } from './model/familia';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { GaEtapa } from './model/etapa';
import { GaAnexoAvulso } from './model/anexo-avulso';
import { GaGrupoOrcamento } from './model/grupo-orcamento';
import { ProjetoAlt } from '../../models';
import { AwModalService } from '@aw-services/core/aw-modal-service';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

export interface GerenciadorArquivosConfig {
  idOrcamento: number;
  idOrcamentoCenario?: number;
  idOrcamentoGrupo: number;
  idProjeto: number;
  readonly?: boolean;
  apenasSelecionados?: boolean;
  title?: string;
  nomeGrupo?: string;
  destroyState?: boolean;
}

@Injectable({ providedIn: 'root' })
export class GerenciadorArquivosService {
  constructor(
    private http: HttpClient,
    private gaAnexoAvulsoStore: GaAnexoAvulsoStore,
    private gaPavimentoStore: GaPavimentoStore,
    private gaEtapaStore: GaEtapaStore,
    private gaAtividadeStore: GaAtividadeStore,
    private gaAtividadeQuery: GaAtividadeQuery,
    private gaEtapaQuery: GaEtapaQuery,
    private awModalService: AwModalService,
    private projetoService: ProjetoService
  ) {}

  target = environment.AwApiUrl + 'gerenciador-arquivos';

  private _gruposOrcamento$ = new BehaviorSubject<GaGrupoOrcamento[]>([]);
  gruposOrcamento$ = this._gruposOrcamento$.asObservable();

  private _extensoes$ = new BehaviorSubject<GaArquivoExtensao[]>([]);
  extensoes$ = this._extensoes$.asObservable();
  extensoesHasLoaded = false;

  projeto$ = this.projetoService.projeto$;

  readonly = false;
  inicializado = false;

  idProjeto: number;
  idOrcamento: number;
  idOrcamentoCenario: number;
  idOrcamentoGrupo: number;

  async showModal(config: GerenciadorArquivosConfig, optionsModal: ModalOptions = {}): Promise<BsModalRef> {
    return this.awModalService.showLazy(() => import('./ga-modal/ga-modal.component').then(c => c.GaModalComponent), {
      ...optionsModal,
      class: 'modal-xxl',
      initialState: config,
      module: () => import('./gerenciador-arquivos.module').then(m => m.GerenciadorArquivosModule),
    });
  }

  setEtapaSelected(etapa: GaEtapa): void {
    this.gaEtapaStore.setActive(etapa.id);
  }

  setPavimentoSelected(projeto: ProjetoAlt, site?: GaSite, edificio?: GaEdificio, andar?: GaAndar): void {
    this.gaPavimentoStore.update(state => ({
      ...state,
      siteSelected: site,
      edificioSelected: edificio,
      andarSelected: andar,
      projetoSelected: projeto,
    }));
  }

  setAtividadesLoading(loading: boolean, etapa: GaEtapa, site: GaSite, edificio?: GaEdificio, andar?: GaAndar): void {
    const id = createIdAtividade(etapa, site, edificio, andar);
    this.gaAtividadeStore.update(state => ({
      ...state,
      loadingAtividades: { ...state.loadingAtividades, [id]: loading },
    }));
  }

  toggleOnlySelecionados($event: boolean): void {
    this.gaAtividadeStore.update(state => ({ ...state, onlySelected: $event }));
  }

  toggleCollapseAtividade(idOrcamentoGrupo: number, atividade: GaAtividade): Observable<GaArquivo[]> {
    const http$ =
      atividade.opened || atividade.arquivos?.length
        ? of([])
        : this.getArquivos(
            atividade.id,
            atividade.idProjeto,
            idOrcamentoGrupo,
            atividade.idEtapa,
            atividade.idAtividade,
            atividade.idCondominio,
            atividade.idEdificio,
            atividade.idPavimento
          ).pipe(
            refreshMap(arquivos => {
              let httpArq$: Observable<GaArquivoGrupo[] | null> = of(null);
              if (arquivos.length === 1) {
                httpArq$ = this.toggleCollapseArquivo(arquivos[0]);
              }
              return httpArq$;
            })
          );
    this.gaAtividadeStore.update(atividade.id, { loading: true });
    return http$.pipe(
      finalize(() => {
        this.gaAtividadeStore.update(atividade.id, { opened: !atividade.opened, loading: false });
      })
    );
  }

  updateArquivo(
    idAtividade: string,
    idArquivo: number,
    partial: Partial<GaArquivo> | ((arquivo: GaArquivo) => GaArquivo)
  ): void {
    const callback = isFunction(partial) ? partial : (arquivo: GaArquivo) => ({ ...arquivo, ...partial });
    this.gaAtividadeStore.update(idAtividade, atividade => ({
      ...atividade,
      arquivos: atividade.arquivos.map(arquivo => {
        if (arquivo.id === idArquivo) {
          arquivo = callback(arquivo);
        }
        return arquivo;
      }),
    }));
  }

  updateVersao(idAtividade: string, idArquivo: number, versao: string, partial: Partial<GaArquivoVersao>): void {
    this.updateArquivo(idAtividade, idArquivo, arquivo => ({
      ...arquivo,
      versoes: arrayUpdate(arquivo.versoes, versao, partial, 'versao'),
    }));
  }

  updateGrupo(idAtividade: string, idArquivo: number, idGrupo: number, partial: Partial<GaArquivoGrupo>): void {
    this.updateArquivo(idAtividade, idArquivo, arquivo => ({
      ...arquivo,
      grupos: arrayUpdate(arquivo.grupos ?? [], idGrupo, partial),
    }));
  }

  superar(arquivo: GaArquivo, comentario: string): void {
    const versaoAtual = arquivo.versoes.find(versao => !versao.superar);
    const novaVersao = arquivo.versoes.find(versao => versao.superar);
    this.updateArquivo(arquivo.idAtividadeStore, arquivo.id, arq => ({
      ...arq,
      comentario,
      superar: true,
      versoes: [
        { ...novaVersao, superar: false, status: 'novo', info: null },
        { ...versaoAtual, status: 'superado', info: null },
      ],
      backup: arq,
    }));
  }

  cancelarEnvio(): void {
    const atividades = this.gaAtividadeQuery.getAll();
    this.gaAtividadeStore.set(
      atividades.map(atividade => ({
        ...atividade,
        arquivos: (atividade.arquivos ?? []).map(arquivo => {
          if (arquivo.superar) {
            arquivo = arquivo.backup;
          }
          return arquivo;
        }),
      }))
    );
  }

  getGruposOrcamento(idOrcamentoCenario: number): Observable<GaGrupoOrcamento[]> {
    return this.http
      .get<GaGrupoOrcamento[]>(`${this.target}/arquivos/orcamentos-cenarios/${idOrcamentoCenario}/grupos`)
      .pipe(
        tap(gruposOrcamento => {
          this._gruposOrcamento$.next(gruposOrcamento);
        })
      );
  }

  inicializar(idProjeto: number, idOrcamentoGrupo: number): Observable<void> {
    const params = new AwHttpParams({ idProjeto, idOrcamentoGrupo });
    return this.http.post<void>(`${this.target}/inicializar`, undefined, { params }).pipe(
      tap(() => {
        this.inicializado = true;
      })
    );
  }

  getAnexosAvulsos(idOrcamentoGrupo: number): Observable<GaAnexoAvulso[]> {
    const params = new AwHttpParams({ idOrcamentoGrupo });
    return this.http.get<GaAnexoAvulso[]>(`${this.target}/anexos-avulsos`, { params }).pipe(
      tap(anexosAvulsos => {
        this.gaAnexoAvulsoStore.set(anexosAvulsos);
        this.gaAnexoAvulsoStore.update(state => ({ ...state, hasLoaded: true }));
      })
    );
  }

  getPavimentos(idProjeto: number): Observable<GaSite[]> {
    const params = new AwHttpParams({ idProjeto });
    return this.http.get<{ sites: GaSite[] }>(`${this.target}/pavimentos`, { params }).pipe(
      map(response => response?.sites ?? []),
      map(pavimentos =>
        pavimentos.map(site => ({
          ...site,
          type: PavimentoType.site,
          edificios: (site.edificios ?? []).map(edificio => ({
            ...edificio,
            idSite: site.id,
            type: PavimentoType.edificio,
            pavimentos: (edificio.pavimentos ?? []).map(pavimento => ({
              ...pavimento,
              idSite: site.id,
              idEdificio: edificio.id,
              type: PavimentoType.andar,
            })),
          })),
        }))
      ),
      tap(pavimentos => {
        this.gaPavimentoStore.set(pavimentos);
        this.gaPavimentoStore.update(state => ({ ...state, hasLoaded: true }));
      })
    );
  }

  getEtapasData(idProjeto: number, idOrcamentoGrupo: number, apenasSelecionados = false): Observable<GaEtapa[]> {
    const params = new AwHttpParams({ idProjeto, idOrcamentoGrupo });
    return this.http
      .get<GaEtapa[]>(`${this.target}/etapas`, {
        params,
      })
      .pipe(
        map(etapas => {
          if (apenasSelecionados) {
            etapas = etapas.filter(etapa => etapa.selecionados > 0 || etapa.id === 0);
          }
          return etapas;
        }),
        uniqByOperator('id')
      );
  }

  getEtapas(idProjeto: number, idOrcamentoGrupo: number, apenasSelecionados = false): Observable<GaEtapa[]> {
    return this.getEtapasData(idProjeto, idOrcamentoGrupo, apenasSelecionados).pipe(
      tap(etapas => {
        this.gaEtapaStore.set(etapas);
        this.gaEtapaStore.update(state => ({ ...state, hasLoaded: true }));
        this.setEtapaSelected(etapas[0] ?? null);
      })
    );
  }

  getExtensoes(idOrcamentoGrupo: number): Observable<GaArquivoExtensao[]> {
    const params = new AwHttpParams({ idOrcamentoGrupo });
    return this.http.get<GaArquivoExtensao[]>(`${this.target}/arquivos/extensoes`, { params }).pipe(
      tap(extensoes => {
        this._extensoes$.next(extensoes);
        this.extensoesHasLoaded = true;
      })
    );
  }

  getAtividades(
    idOrcamentoGrupo: number,
    idProjeto: number,
    idEtapa: number,
    idCondominio: number,
    idEdificio?: number,
    idPavimento?: number
  ): Observable<GaAtividade[]> {
    const params = new AwHttpParams(
      {
        idOrcamentoGrupo,
        idProjeto,
        idEtapa,
        idCondominio,
        idEdificio,
        idPavimento,
      },
      true
    );
    return this.http
      .get<GaAtividade[]>(`${this.target}/atividades`, {
        params,
      })
      .pipe(
        map(atividades => atividades.map(replaceNullWithUndefined)),
        map(atividades =>
          atividades.map(atividade => ({ ...atividade, opened: false, id: getAtividadeId(atividade) }))
        ),
        tap(atividades => {
          this.gaAtividadeStore.upsertMany(atividades);
        })
      );
  }

  toggleEtapa(idProjeto: number, idEtapa: number, ativo: boolean): Observable<void> {
    this.gaEtapaStore.update(idEtapa, { ativo, loading: true });
    const params = new AwHttpParams({ idEtapa, idProjeto });
    return this.http.put<void>(`${this.target}/status/${ativo ? 'ativar' : 'desativar'}`, undefined, { params }).pipe(
      finalize(() => {
        this.gaEtapaStore.update(idEtapa, { loading: false });
      }),
      catchAndThrow(() => {
        this.gaEtapaStore.update(idEtapa, { ativo: !ativo });
      })
    );
  }

  getFileBase64(idOrcamento: number, idOrcamentoGrupo: number, anexo: GaAnexoAvulso): Observable<string> {
    this.gaAnexoAvulsoStore.update(anexo.idOrcamentoGrupoAnexo, { downloading: true });
    return this.http
      .get<{ data: string }>(
        `${environment.downloadUrl}orcamentos/${idOrcamento}/grupos/${idOrcamentoGrupo}/downloads/${anexo.nomeArquivo}`
      )
      .pipe(
        pluck('data'),
        tap(() => {
          this.gaAnexoAvulsoStore.update(anexo.idOrcamentoGrupoAnexo, { downloading: false });
        })
      );
  }

  putAnexoAvulso(idOrcamentoGrupoAnexo: number, check: boolean): Observable<void> {
    const params = new AwHttpParams({ idOrcamentoGrupoAnexo, check });
    return this.http.put<void>(`${this.target}/anexos-avulsos`, undefined, { params });
  }

  toggleAnexo({ idOrcamentoGrupoAnexo }: GaAnexoAvulso, ativo: boolean): Observable<void> {
    this.gaAnexoAvulsoStore.update(idOrcamentoGrupoAnexo, { loading: true });
    return this.putAnexoAvulso(idOrcamentoGrupoAnexo, ativo).pipe(
      finalize(() => {
        this.gaAnexoAvulsoStore.update(idOrcamentoGrupoAnexo, { ativo, loading: false });
        this.gaEtapaStore.update(0, etapa => ({
          ...etapa,
          selecionados: ativo ? etapa.selecionados + 1 : etapa.selecionados - 1,
        }));
      })
    );
  }

  toggleMultipleAnexo(anexos: GaAnexoAvulso[], $event: boolean): Observable<void> {
    const requests$ = anexos.map(anexo => this.putAnexoAvulso(anexo.idOrcamentoGrupoAnexo, $event));
    const ids = anexos.map(anexo => anexo.idOrcamentoGrupoAnexo);
    this.gaAnexoAvulsoStore.update(ids, { loading: true });
    return forkJoin(requests$).pipe(
      finalize(() => {
        this.gaAnexoAvulsoStore.update(ids, { ativo: $event, loading: false });
        this.gaEtapaStore.update(0, etapa => ({
          ...etapa,
          selecionados: $event ? etapa.selecionados + anexos.length : etapa.selecionados - anexos.length,
        }));
      }),
      map(() => {})
    );
  }

  getArquivos(
    id: string,
    idProjeto: number,
    idOrcamentoGrupo: number,
    idEtapa: number,
    idAtividade: number,
    idCondominio: number,
    idEdificio?: number,
    idPavimento?: number
  ): Observable<GaArquivo[]> {
    const params = new AwHttpParams(
      {
        idProjeto,
        idOrcamentoGrupo,
        idEtapa,
        idAtividade,
        idCondominio,
        idEdificio,
        idPavimento,
      },
      true
    );
    return this.http.get<GaArquivo[]>(`${this.target}/arquivos`, { params }).pipe(
      map(arquivos =>
        arquivos.map(arquivo => ({
          ...arquivo,
          idProjeto,
          idEtapa,
          idAtividade,
          idCondominio,
          idEdificio,
          idPavimento,
          idAtividadeStore: id,
        }))
      ),
      tap(arquivos => {
        this.gaAtividadeStore.update(id, { arquivos });
      })
    );
  }

  getVersaoInfo(idAtividade: string, idArquivo: number, versao: string): Observable<GaArquivoVersaoInfo> {
    this.updateVersao(idAtividade, idArquivo, versao, { loading: true });
    const params = new AwHttpParams({ versao });
    return this.http.get<GaArquivoVersaoInfo>(`${this.target}/arquivos/${idArquivo}/info`, { params }).pipe(
      tap(info => {
        this.updateVersao(idAtividade, idArquivo, versao, { loading: false, info });
      }),
      catchAndThrow(() => {
        this.updateVersao(idAtividade, idArquivo, versao, { loading: false });
      })
    );
  }

  addGrupos(arquivo: GaArquivo, idsOrcamentoGrupo: number[]): Observable<void> {
    this.updateArquivo(arquivo.idAtividadeStore, arquivo.id, { loading: true });
    return this.http.post<void>(`${this.target}/arquivos/${arquivo.id}/grupos`, idsOrcamentoGrupo).pipe(
      finalize(() => {
        const partial: Partial<GaArquivo> = { loading: false };
        if (idsOrcamentoGrupo.includes(this.idOrcamentoGrupo)) {
          partial.checked = true;
          this.gaEtapaStore.update(arquivo.idEtapa, etapa => ({
            ...etapa,
            selecionados: etapa.selecionados + 1,
          }));
        }
        this.updateArquivo(arquivo.idAtividadeStore, arquivo.id, partial);
      }),
      refresh(this.getGrupos(arquivo.idAtividadeStore, arquivo.id))
    );
  }

  deleteGrupo(arquivo: GaArquivo, idOrcamentoGrupo: number): Observable<void> {
    this.updateGrupo(arquivo.idAtividadeStore, arquivo.id, idOrcamentoGrupo, { loading: true });
    const params = new AwHttpParams({ idOrcamentoGrupo });
    return this.http.delete<void>(`${this.target}/arquivos/${arquivo.id}/grupos`, { params }).pipe(
      tap(() => {
        const partial: Partial<GaArquivo> = {};
        if (this.idOrcamentoGrupo === idOrcamentoGrupo) {
          partial.loading = false;
          partial.checked = false;
          this.gaEtapaStore.update(arquivo.idEtapa, etapa => ({
            ...etapa,
            selecionados: etapa.selecionados - 1,
          }));
        }
        this.updateArquivo(arquivo.idAtividadeStore, arquivo.id, arq => ({
          ...arq,
          grupos: arrayRemove(arq.grupos ?? [], idOrcamentoGrupo),
          ...partial,
        }));
      }),
      finalize(() => {
        this.updateGrupo(arquivo.idAtividadeStore, arquivo.id, idOrcamentoGrupo, { loading: false });
      })
    );
  }

  toggleArquivo(idOrcamentoGrupo: number, arquivo: GaArquivo): Observable<void> {
    this.updateArquivo(arquivo.idAtividadeStore, arquivo.id, { loading: true });
    const http$ = arquivo.checked
      ? this.deleteGrupo(arquivo, idOrcamentoGrupo)
      : this.addGrupos(arquivo, [idOrcamentoGrupo]);
    return http$.pipe(
      finalize(() => {
        this.updateArquivo(arquivo.idAtividadeStore, arquivo.id, { loading: false });
      })
    );
  }

  clearSuperados(etapas: number[], atividades: string[], arquivos: number[]): void {
    const mapEtapas: Record<number, number> = etapas.reduce(
      (acc, item) => ({ ...acc, [item]: (acc[item] ?? 0) + 1 }),
      {}
    );
    const mapAtividades: Record<string, number> = atividades.reduce(
      (acc, item) => ({ ...acc, [item]: (acc[item] ?? 0) + 1 }),
      {}
    );
    const etapasStore = this.gaEtapaQuery.getAll();
    const atividadesStore = this.gaAtividadeQuery.getAll();
    this.gaEtapaStore.set(
      etapasStore.map(etapa => {
        if (mapEtapas[etapa.id]) {
          etapa = {
            ...etapa,
            'qtde-superar': etapa['qtde-superar'] - mapEtapas[etapa.id],
          };
        }
        return etapa;
      })
    );
    this.gaAtividadeStore.set(
      atividadesStore.map(atividade => {
        if (mapAtividades[atividade.id]) {
          atividade = {
            ...atividade,
            qtdeSuperar: atividade.qtdeSuperar - mapAtividades[atividade.id],
            arquivos: (atividade.arquivos ?? []).map(arquivo => {
              if (arquivos.includes(arquivo.id)) {
                arquivo = {
                  ...arquivo,
                  superar: false,
                  versoes: [
                    {
                      ...arquivo.versoes[0],
                      status: '',
                      superar: false,
                      info: null,
                    },
                  ],
                };
              }
              return arquivo;
            }),
          };
        }
        return atividade;
      })
    );
  }

  getSuperados(): [arquivos: GaArquivoSuperar[], etapas: number[], atividades: string[]] {
    const atividades = this.gaAtividadeQuery.getAll().filter(atividade => atividade.qtdeSuperar);
    const arquivos: GaArquivoSuperar[] = [];
    const etapas: number[] = [];
    const atividadesSuperar: string[] = [];
    for (const atividade of atividades) {
      for (const arquivo of (atividade.arquivos ?? []).filter(arq => arq.superar)) {
        arquivos.push({ idArquiteturaArquivo: arquivo.id, comentario: arquivo.comentario });
        etapas.push(arquivo.idEtapa);
        atividadesSuperar.push(arquivo.idAtividadeStore);
      }
    }
    return [arquivos, etapas, atividadesSuperar];
  }

  superarApi(): Observable<void> {
    const [arquivos, etapas, atividades] = this.getSuperados();
    if (!arquivos.length) {
      return of(undefined);
    }
    return this.http.post<void>(`${this.target}/arquivos/superar`, arquivos).pipe(
      finalize(() => {
        this.clearSuperados(
          etapas,
          atividades,
          arquivos.map(arq => arq.idArquiteturaArquivo)
        );
      })
    );
  }

  toggleCollapseArquivo(arquivo: GaArquivo): Observable<GaArquivoGrupo[]> {
    const opened = !arquivo.opened;
    const hasGrupos = arquivo.grupos?.length;
    this.updateArquivo(arquivo.idAtividadeStore, arquivo.id, { openedLoading: true });
    const http$ = opened && !hasGrupos ? this.getGrupos(arquivo.idAtividadeStore, arquivo.id) : of([]);
    return http$.pipe(
      finalize(() => {
        this.updateArquivo(arquivo.idAtividadeStore, arquivo.id, { opened, openedLoading: false });
      })
    );
  }

  getGrupos(idAtividade: string, idArquivo: number): Observable<GaArquivoGrupo[]> {
    return this.http.get<GaArquivoGrupo[]>(`${this.target}/arquivos/${idArquivo}/grupos`).pipe(
      tap(grupos => {
        this.updateArquivo(idAtividade, idArquivo, { grupos });
      })
    );
  }

  getFamilias(idAtividade: string, idOrcamentoCenario: number, idArquivo: number): Observable<GaFamilia[]> {
    const params = new AwHttpParams({ idOrcamentoCenario, idArquiteturaArquivo: idArquivo });
    return this.http.get<{ familias: GaFamilia[] }>(`${this.target}/grupos`, { params }).pipe(
      map(resp => resp.familias ?? []),
      map(familias => familias.map((familia, index) => ({ ...familia, opened: !index }))),
      tap(familias => {
        this.updateArquivo(idAtividade, idArquivo, { familias });
      })
    );
  }

  resetState(): void {
    this.inicializado = false;
    this.readonly = false;
    this._gruposOrcamento$.next([]);
    this.gaAnexoAvulsoStore.reset();
    this.gaEtapaStore.reset();
    this.gaPavimentoStore.reset();
    this.gaAtividadeStore.reset();
    this.idProjeto = null;
    this.idOrcamento = null;
    this.idOrcamentoCenario = null;
    this.idOrcamentoGrupo = null;
  }

  grupoChanged(): void {
    this.gaAtividadeStore.reset();
    this.gaPavimentoStore.update({ andarSelected: undefined, siteSelected: undefined, edificioSelected: undefined });
  }
}
