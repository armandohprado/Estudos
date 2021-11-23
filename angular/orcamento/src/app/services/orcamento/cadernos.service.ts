import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { Planilha } from '@aw-models/planilha';
import {
  Caderno,
  CadernoCentroCustoOrcamentoFiltro,
  CadernoGrupoOrcamentoFiltro,
  CadernoPavimentoOrcamentoFiltro,
  PlanilhaOpcaoRelatorio,
  PlanilhaOpcaoRelatorioPost,
} from '@aw-models/cadernos/caderno';
import {
  CadernoLayout,
  CadernoLayoutPost,
  CadernoPostJustificacao,
  CadernoPostUpload,
  CadernoResumoJustificacao,
} from '@aw-models/cadernos/cadernoLayout';
import { isFunction } from 'lodash-es';
import { upsert } from '@aw-utils/util';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { mapCadernos } from '../../orcamento/cenarios/cadernos/util';

@Injectable({
  providedIn: 'root',
})
export class CadernosService {
  constructor(private http: HttpClient) {}

  caderno$ = new BehaviorSubject<Caderno>(null);
  cadernos$ = new BehaviorSubject<Caderno[]>([]);

  private _cadernoLayouts$ = new BehaviorSubject<CadernoLayout[]>([]);
  cadernoLayouts$ = this._cadernoLayouts$.asObservable();
  feedBackController$ = new BehaviorSubject<boolean>(false);

  get cadernoLayoutsSnapshot(): CadernoLayout[] {
    return this._cadernoLayouts$.value;
  }

  showSuccessFeedback(): void {
    this.feedBackController$.next(true);
    setTimeout(() => {
      this.feedBackController$.next(false);
    }, 1000);
  }

  getCadernos(idCenario: number): Observable<Caderno[]> {
    return this.http.get<Caderno[]>(`${environment.ApiUrl}cenarios/${idCenario}/cadernos`).pipe(
      map(mapCadernos),
      tap(cadernos => this.cadernos$.next(cadernos))
    );
  }

  getCadernoLayouts(idCaderno: number): Observable<CadernoLayout[]> {
    const layouts$ = this.http.get<CadernoLayout[]>(`${environment.AwApiUrl}orcamento-cenario/cadernos-layouts`);
    const seleciados$ = this.getCadernosSelecionados(idCaderno);
    return forkJoin([layouts$, seleciados$]).pipe(
      map(([layouts, selecionados]) => {
        return layouts.map(layout => ({
          ...layout,
          checked: selecionados.some(selecionado => selecionado.idCadernoLayout === layout.idCadernoLayout),
        }));
      }),
      tap(layouts => this._cadernoLayouts$.next(layouts))
    );
  }

  getCadernosSelecionados(idCaderno: number): Observable<CadernoLayout[]> {
    return this.http.get<CadernoLayout[]>(
      `${environment.AwApiUrl}orcamento-cenario/cadernos/${idCaderno}/cadernos-layouts/selecionados`
    );
  }

  getOpcoesRelatorios(idCaderno: number): Observable<PlanilhaOpcaoRelatorio[]> {
    return this.http.get<PlanilhaOpcaoRelatorio[]>(
      `${environment.AwApiUrl}orcamento-cenario/cadernos/${idCaderno}/opcoes-relatorios`
    );
  }

  postOpcoesRelatorios(payload: PlanilhaOpcaoRelatorioPost): Observable<PlanilhaOpcaoRelatorioPost> {
    return this.http.post<PlanilhaOpcaoRelatorioPost>(
      `${environment.AwApiUrl}orcamento-cenario/cadernos/download-relatorio`,
      payload
    );
  }

  postCadernoLayout(payload: CadernoLayoutPost[], idCaderno: number): Observable<boolean> {
    return this.http.post<boolean>(
      `${environment.AwApiUrl}orcamento-cenario/cadernos/${idCaderno}/cadernos-layouts`,
      payload
    );
  }

  refreshCaderno(idCaderno: number, idOrcamentoCenario: number): Observable<Caderno> {
    return this.getCadernosById(idCaderno, idOrcamentoCenario).pipe(tap(caderno => this.caderno$.next(caderno)));
  }

  getCadernosById(idCaderno: number, idCenario: number): Observable<Caderno> {
    return this.http.get<Caderno>(`${environment.AwApiUrl}orcamento-cenario/cadernos/${idCaderno}`).pipe(
      map(caderno => {
        caderno = {
          ...caderno,
          cadernoConfiguracaoColunasTipo: [
            {
              ...caderno.cadernoConfiguracaoColunasTipo[0],
              idCaderno: caderno.idCaderno,
              exibeValorTotal: this.default(
                caderno.nomeCaderno,
                caderno.cadernoConfiguracaoColunasTipo[0]?.exibeValorTotal
              ),
              exibeValorUnitarioProdutoServico: this.default(
                caderno.nomeCaderno,
                caderno.cadernoConfiguracaoColunasTipo[0]?.exibeValorUnitarioProdutoServico
              ),
              exibeAndaresColunados: this.default(
                caderno.nomeCaderno,
                caderno.cadernoConfiguracaoColunasTipo[0]?.exibeAndaresColunados
              ),
              exibeDescontoProduto: this.default(
                caderno.nomeCaderno,
                caderno.cadernoConfiguracaoColunasTipo[0]?.exibeDescontoProduto
              ),
              exibeDescontoServico: this.default(
                caderno.nomeCaderno,
                caderno.cadernoConfiguracaoColunasTipo[0]?.exibeDescontoServico
              ),
              exibeValorUnitarioProduto: this.default(
                caderno.nomeCaderno,
                caderno.cadernoConfiguracaoColunasTipo[0]?.exibeValorUnitarioProduto
              ),
              exibeValorUnitarioServico: this.default(
                caderno.nomeCaderno,
                caderno.cadernoConfiguracaoColunasTipo[0]?.exibeValorUnitarioServico
              ),
            },
          ],
          cadernoConfiguracaoNivel: [
            ...caderno.cadernoConfiguracaoNivel.map(nivel => {
              return { ...nivel, exibe: this.default(caderno.nomeCaderno, nivel.exibe) };
            }),
          ],
          cadernoConfiguracaoAndar: caderno.cadernoConfiguracaoAndar.map(andar => ({
            ...andar,
            exibe: this.default(caderno.nomeCaderno, andar.exibe),
          })),
          cadernoConfiguracaoCentroCusto: caderno.cadernoConfiguracaoCentroCusto.map(centroCusto => ({
            ...centroCusto,
            exibe: this.default(caderno.nomeCaderno, centroCusto.exibe),
          })),
          cadernoConfiguracaoGrupo: caderno.cadernoConfiguracaoGrupo.map(grupo => ({
            ...grupo,
            exibe: this.default(caderno.nomeCaderno, grupo.exibe),
          })),
        };
        return caderno;
      })
    );
  }

  default(value: string, def: boolean): boolean {
    return value === '' || !!def;
  }

  postCadernoConfig(idCaderno: number): Observable<any> {
    const {
      cadernoConfiguracaoAndar,
      cadernoConfiguracaoCentroCusto,
      cadernoConfiguracaoColunasTipo,
      cadernoConfiguracaoGrupo,
      cadernoConfiguracaoNivel,
      nomeCaderno,
    } = this.caderno$.value;

    const payload = {
      nomeCaderno,
      cadernoConfiguracaoAndar,
      cadernoConfiguracaoCentroCusto,
      cadernoConfiguracaoColunasTipo,
      cadernoConfiguracaoGrupo,
      cadernoConfiguracaoNivel,
    };

    return this.http.post<any>(`${environment.AwApiUrl}orcamento-cenario/cadernos/${idCaderno}/configuracoes`, payload);
  }

  getCentrosCustoPorProjeto(idProjeto: number): Observable<CadernoCentroCustoOrcamentoFiltro[]> {
    return this.http.get<CadernoCentroCustoOrcamentoFiltro[]>(`${environment.AwApiUrl}centro-custos/${idProjeto}`).pipe(
      map(centroCustos => {
        centroCustos = centroCustos.map(centroCusto => {
          return {
            ...centroCusto,
            idCaderno: this.caderno$.value.idCaderno,
            exibe: this.default(this.caderno$.value.nomeCaderno, centroCusto.exibe),
          };
        });
        return centroCustos;
      }),
      tap(centroCustos => {
        this.caderno$.next({
          ...this.caderno$.value,
          cadernoConfiguracaoCentroCusto: upsert(
            centroCustos,
            this.caderno$.value.cadernoConfiguracaoCentroCusto,
            'idProjetoCentroCusto'
          ),
        });
      })
    );
  }

  getPavimentos(idOrcamento: number): Observable<CadernoPavimentoOrcamentoFiltro[]> {
    return this.http.get<CadernoPavimentoOrcamentoFiltro[]>(`${environment.AwApiUrl}pavimentos/${idOrcamento}`).pipe(
      map(pavimentos => {
        pavimentos = pavimentos.map(pavimento => {
          return {
            ...pavimento,
            idCaderno: this.caderno$.value.idCaderno,
            exibe: this.default(this.caderno$.value.nomeCaderno, pavimento.exibe),
          };
        });
        return pavimentos;
      }),
      tap(pavimentos => {
        this.caderno$.next({
          ...this.caderno$.value,
          cadernoConfiguracaoAndar: upsert(
            pavimentos,
            this.caderno$.value.cadernoConfiguracaoAndar,
            'idProjetoEdificioPavimento'
          ),
        });
      })
    );
  }

  getOrcamentoGrupos(idOrcamentoCenario: number): Observable<CadernoGrupoOrcamentoFiltro[]> {
    return this.http
      .get<CadernoGrupoOrcamentoFiltro[]>(
        `${environment.AwApiUrl}orcamento-cenario/${idOrcamentoCenario}/orcamento-grupos`
      )
      .pipe(
        map(grupos => {
          const cadernoGrupos = this.caderno$.value.cadernoConfiguracaoGrupo ?? [];
          return orderBy(
            grupos.map(grupo => {
              const cadernoGrupo = cadernoGrupos.find(cGrupo => cGrupo.idOrcamentoGrupo === grupo.idOrcamentoGrupo);
              return {
                idCaderno: this.caderno$.value.idCaderno,
                exibe: this.default(this.caderno$.value.nomeCaderno, grupo.exibe),
                ...grupo,
                ...cadernoGrupo,
              };
            }),
            orderByCodigo<CadernoGrupoOrcamentoFiltro>('codigoGrupo')
          );
        }),
        tap(grupos => {
          this.caderno$.next({ ...this.caderno$.value, cadernoConfiguracaoGrupo: grupos });
        })
      );
  }

  createCaderno(idCenario: number, body?: Caderno): Observable<Caderno> {
    let payload: any;
    if (body) {
      payload = body;
    } else {
      payload = {
        idOrcamentoCenario: idCenario,
        enviadoCliente: false,
        nomeCaderno: '',
        cadernoPadrao: false,
        nomeItemExcluso: 'Itens não considerados',
        nomeCondicaoGeral: 'Condições Gerais de Fornecimento',
        habilitadoItemExcluso: true,
        habilitadoCondicaoGeral: true,
      };
    }
    return this.http.post<Caderno>(`${environment.ApiUrl}cenarios/${idCenario}/cadernos`, payload);
  }

  updateCaderno(idCenario: string, idCaderno: number, payload: Caderno): Observable<Caderno> {
    return this.http.put<Caderno>(`${environment.ApiUrl}cenarios/${idCenario}/cadernos/${idCaderno}`, payload).pipe(
      tap(caderno => {
        this.caderno$.next(caderno);
      })
    );
  }

  updateCadernoCenarioStatus(idCenario: number, idCaderno: number, payload: Caderno): Observable<Caderno> {
    return this.http.put<Caderno>(
      `${environment.ApiUrl}cenarios/${idCenario}/cadernos/${idCaderno}/enviado-cliente`,
      payload
    );
  }

  deleteCaderno(idCenario: number, idCaderno: number): Observable<void> {
    return this.http.delete<void>(`${environment.ApiUrl}cenarios/${idCenario}/cadernos/${idCaderno}`);
  }

  createPlanilha(idCaderno: string, idCenario: string, body: Planilha): Observable<Planilha> {
    return this.http.post<Planilha>(`${environment.ApiUrl}cenarios/${idCenario}/cadernos/${idCaderno}/planilhas`, body);
  }

  updatePlanilha(idCaderno: number, idCenario: number, idPlanilha: number, body: Planilha): Observable<Planilha> {
    return this.http.put<Planilha>(
      `${environment.ApiUrl}cenarios/${idCenario}/cadernos/${idCaderno}/planilhas/${idPlanilha}`,
      body
    );
  }

  deletePlanilha(idCaderno: string, idCenario: string, idPlanilha: string): Observable<any> {
    return this.http.delete<Planilha>(
      `${environment.ApiUrl}cenarios/${idCenario}/cadernos/${idCaderno}/planilhas/${idPlanilha}`
    );
  }

  uploadCadernoLogo(idCenario: any, idCaderno: any, file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');
    return this.http.post(
      `${environment.ApiUrl}cenarios/${idCenario}/cadernos/${idCaderno}/logotipo-upload`,
      formData,
      {
        headers,
      }
    );
  }

  getCadernoLogo(idCenario: any, idCaderno: any): Observable<any> {
    return this.http.get<any>(`${environment.ApiUrl}cenarios/${idCenario}/cadernos/${idCaderno}/logotipo-download`);
  }

  updateCadernoLayout(
    idCadernoLayout: number | ((layout: CadernoLayout) => boolean),
    partial: Partial<CadernoLayout> | ((layout: CadernoLayout) => CadernoLayout)
  ): void {
    const predicate = isFunction(idCadernoLayout)
      ? idCadernoLayout
      : (layout: CadernoLayout) => layout.idCadernoLayout === idCadernoLayout;
    const callback = isFunction(partial) ? partial : (layout: CadernoLayout) => ({ ...layout, ...partial });
    this._cadernoLayouts$.next(
      this._cadernoLayouts$.value.map(layout => {
        if (predicate(layout)) {
          layout = callback(layout);
        }
        return layout;
      })
    );
  }

  sendFormUpload(idOrcamentoCenario: number, files: any): Observable<CadernoPostUpload[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('file', file, file.name);
    }
    const headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');
    return this.http.post<CadernoPostUpload[]>(
      `${environment.AwApiUrl}orcamento-cenario/${idOrcamentoCenario}/upload-evidencias-aprovacao-ceo`,
      formData,
      {
        headers,
      }
    );
  }

  sendFormUploadJustificativa(idOrcamentoCenario: number, justificacao: string): Observable<CadernoPostJustificacao[]> {
    return this.http.post<CadernoPostJustificacao[]>(
      `${environment.AwApiUrl}orcamento-cenario/${idOrcamentoCenario}/justificacao-inexistencia-evidencias-aprovacao-ceo`,
      { justificacao }
    );
  }

  getEvidencias(idOrcamentoCenario: number): Observable<CadernoResumoJustificacao[]> {
    return this.http.get<CadernoResumoJustificacao[]>(
      `${environment.AwApiUrl}orcamento-cenario/${idOrcamentoCenario}/evidencias-aprovacao-ceo`
    );
  }
}
