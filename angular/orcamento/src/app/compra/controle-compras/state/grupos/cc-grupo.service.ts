import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CcGrupoStore } from './cc-grupo.store';
import { CnGrupo, CnGruposTabsEnum, CnTipoGrupoEnum } from '../../../models/cn-grupo';
import { environment } from '../../../../../environments/environment';
import { forkJoin, MonoTypeOperatorFunction, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { defaultIfEmpty, filter, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { CcGrupoQuery } from './cc-grupo.query';
import { arrayUpdate, UpdateStateCallback } from '@datorama/akita';
import { CnEnvioMapaPayload, CnMapa } from '../../../models/cn-mapa';
import { CnFornecedor } from '../../../models/cn-fornecedor';
import { GrupoTransferencia } from '@aw-models/controle-compras/grupo-transferencia';
import { CnConfirmacaoCompraGrupo } from '../../../models/cn-confirmacao-compra-grupo';
import {
  CnConfirmacaoCompra,
  CnConfirmacaoCompraDadosGrupo,
  CnConfirmacaoCompraFornecedor,
} from '../../../models/cn-confirmacao-compra';
import { ControleComprasQuery } from '../controle-compras/controle-compras.query';
import {
  CnEmitirCc,
  CnEmitirCcPayload,
  CnEmitirCcPayloadMiscellaneous,
  CnEmitirCcPayloadRevenda,
  CnEmitirCcPayloadSemMapa,
} from '../../../models/cn-emitir-cc';
import { CnTransacoesAtual } from '../../../models/cn-transacoes-atual';
import { CnHistoricoMapa } from '../../../models/cn-historico-mapa';
import { isNil, sumBy } from 'lodash-es';
import { CcCabecalhoService } from '../cabecalho/cc-cabecalho.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CnClassificacao } from '../../../models/cn-classificacao';
import {
  PlanilhaHibridaTransferirSaldoCC,
  PlanilhaHibridaTransferirSaldoDto,
} from '../../../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { FamiliaTransacao } from '../../../../orcamento/planilha-vendas-hibrida/models/transacao';
import { orderBy, orderByOperator } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { FamiliaTransferenciaCC, GruposTransferenciaCC, TransferenciaCC } from '@aw-models/transferencia-cc';
import { GrupoConfirmacaoCompra } from '../../../../orcamento/planilha-vendas-hibrida/models/confirmacao-compra';
import { CnMigracaoGrupo, CnMigracaoGrupoPayload } from '../../../models/cn-migracao-grupo';
import { catchAndThrow, reduceTo, refresh, refreshAll } from '@aw-utils/rxjs/operators';
import { AwHttpParams } from '@aw-utils/http-params';
import { CnFichaPayload } from '../../../models/cn-ficha-payload';
import {
  cnGetValorSaldoAtualizado,
  cnGrupoMerge,
  cnMapConfirmacaoCompraFornecedorFactory,
  cnMapGruposTransferencia,
  cnMapMigracaoBudgetResumoGrupos,
  cnOrderGrupos,
  mapCnConfirmacaoCompra,
  mapCnGrupos,
  mapCnMapaTotais,
  mapCnPavimentosEmitirCc,
} from '../../util';
import { CnFichaAlt } from '../../../models/cn-ficha-alt';
import { upsert } from '@aw-utils/util';
import { orderByCodigoWithoutDefinedNumberOfDots } from '@aw-utils/grupo-item/sort-by-numeracao';
import { PlanoCompraQuestao } from '@aw-models/plano-compra-questao';
import { CnMigracaoBudgetGrupo } from '../../../models/cn-migracao-budget-grupo';
import { CnMigracaoBudgetResumoResponse } from '../../../models/cn-migracao-budget-resumo';
import { CnMigracaoBudgetPayload } from '../../../models/cn-migracao-budget';
import { CnGerenciarGrupo } from '../../../models/cn-gerenciar-grupo';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Injectable({ providedIn: 'root' })
export class CcGrupoService {
  constructor(
    private ccGruposStore: CcGrupoStore,
    private http: HttpClient,
    private ccGruposQuery: CcGrupoQuery,
    private controleComprasQuery: ControleComprasQuery,
    private ccCabecalhoService: CcCabecalhoService,
    private routerQuery: RouterQuery,
    private orcamentoAltService: OrcamentoAltService
  ) {}

  private targetAw = environment.AwApiUrl + 'compras-negociacao';
  private targetAwCenarios = environment.AwApiUrl + 'compras-negociacao/orcamento-cenarios';
  private targetGrupos = this.targetAw + '/grupos';

  private _updateTabConfirmacaoCompraCCForm$ = new Subject<
    [idCompraNegociacaoGrupo: number, cnConfirmacaoCompra: CnConfirmacaoCompra]
  >();

  listaCCTransferencia$: Observable<TransferenciaCC[]>;
  listaFamilia$: Observable<FamiliaTransferenciaCC[]>;
  listaGrupo$: Observable<GruposTransferenciaCC[]>;

  private _getGrupos(idOrcamentoCenario: number, tipo: CnTipoGrupoEnum): Observable<CnGrupo[]> {
    return this.http
      .get<CnGrupo[]>(`${this.targetAwCenarios}/${idOrcamentoCenario}/grupos/${tipo}`)
      .pipe(map(grupos => mapCnGrupos(grupos, tipo)));
  }

  private _mergeGrupos(grupos: CnGrupo[], tipo?: CnTipoGrupoEnum): void {
    const gruposAtual = this.ccGruposQuery
      .getAll()
      // Filtrar os grupos que foram removidos no gerenciar grupos
      .filter(grupoAtual =>
        grupos.some(
          grupo =>
            grupo.idCompraNegociacaoGrupo === grupoAtual.idCompraNegociacaoGrupo || (tipo && tipo !== grupoAtual.tipo)
        )
      );
    this.ccGruposStore.set(cnOrderGrupos(upsert(gruposAtual, grupos, 'idCompraNegociacaoGrupo', cnGrupoMerge)));
  }

  selectUpdateTabConfirmacaoCompraCCForm(idCompraNegociacaoGrupo: number): Observable<CnConfirmacaoCompra> {
    return this._updateTabConfirmacaoCompraCCForm$.pipe(
      filter(([_idCompraNegociacaoGrupo]) => _idCompraNegociacaoGrupo === idCompraNegociacaoGrupo),
      map(([, cnConfirmacaoCompra]) => cnConfirmacaoCompra)
    );
  }

  reset(): void {
    this.ccGruposStore.reset();
  }

  getSetTransferenciaCC(idOrcamento: number, idPlanilhaHibrida: number): void {
    this.listaCCTransferencia$ = this.getCCSaldoDisponivel(idOrcamento, idPlanilhaHibrida).pipe(shareReplay());
    this.listaFamilia$ = this.listaCCTransferencia$.pipe(reduceTo('familias'));
    this.listaGrupo$ = this.listaFamilia$.pipe(reduceTo('grupos'));
  }

  getMapaAtual(idCompraNegociacaoGrupo: number): Observable<CnMapa> {
    this.updateGrupo(idCompraNegociacaoGrupo, { refreshingGrupoAtual: true });
    return this.http.get<CnMapa>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/mapas/atual`).pipe(
      this.mapTotaisMapa(idCompraNegociacaoGrupo),
      tap(mapaAtual => {
        this.updateGrupo(idCompraNegociacaoGrupo, { mapaAtual });
      }),
      finalize(() => {
        this.updateGrupo(idCompraNegociacaoGrupo, {
          refreshingGrupoAtual: false,
        });
      })
    );
  }

  getMapa(idCompraNegociacaoGrupo: number, idCompraNegociacaoGrupoMapa: number): Observable<CnMapa> {
    return this.http.get<CnMapa>(`${this.targetGrupos}/mapas/${idCompraNegociacaoGrupoMapa}`).pipe(
      this.mapTotaisMapa(idCompraNegociacaoGrupo),
      tap(mapaAtual => {
        this.ccGruposStore.update(idCompraNegociacaoGrupo, { mapaAtual });
      })
    );
  }

  getVisualizarMapa(idCompraNegociacaoGrupoMapa: number, idCompraNegociacaoGrupo: number): Observable<CnMapa> {
    return this.getMapa(idCompraNegociacaoGrupo, idCompraNegociacaoGrupoMapa).pipe(
      tap(visualizarMapa => {
        this.ccGruposStore.update(idCompraNegociacaoGrupo, { visualizarMapa });
      })
    );
  }

  getMapaHistorico(idCompraNegociacaoGrupo: number): Observable<CnHistoricoMapa[]> {
    return this.http.get<CnHistoricoMapa[]>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/mapas`).pipe(
      tap(historicoMapa => {
        this.ccGruposStore.update(idCompraNegociacaoGrupo, { historicoMapa });
      })
    );
  }

  getGruposTransferencia(
    idCompraNegociacaoGrupo: number,
    idCompraNegociacao: number,
    tipo: string
  ): Observable<GrupoTransferencia[]> {
    return this.http
      .get<GrupoTransferencia[]>(
        `${this.targetAw}/${idCompraNegociacao}/grupos/${idCompraNegociacaoGrupo}/${tipo}/saldo-disponivel`
      )
      .pipe(
        map(cnMapGruposTransferencia),
        tap(gruposTransferencia => {
          this.updateGrupo(idCompraNegociacaoGrupo, { gruposTransferencia });
        })
      );
  }

  getPropostaFornecedores(idCompraNegociacaoGrupo): Observable<CnFornecedor[]> {
    return this.http.get<CnFornecedor[]>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/propostas-fornecedores`).pipe(
      map(fornecedores =>
        fornecedores
          .filter(fornecedor => fornecedor?.valorTotalOrcado > 0)
          .map(fornecedor => ({ ...fornecedor, selecionado: fornecedor?.mapaEmitido }))
      ),
      tap(gruposFornecedores => {
        this.updateGrupo(idCompraNegociacaoGrupo, {
          gruposFornecedores,
        });
      })
    );
  }

  getExtratoTransacao(idCompraNegociacaoGrupo: number): Observable<CnTransacoesAtual> {
    return this.http.get<CnTransacoesAtual>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/extrato-transacao`).pipe(
      tap(transacoesAtual => {
        this.updateGrupoCallback(idCompraNegociacaoGrupo, ccGrupo => ({
          ...ccGrupo,
          transacoesAtual: {
            ...transacoesAtual,
            compraNegociacaoGrupoExtratoTransacao: transacoesAtual.compraNegociacaoGrupoExtratoTransacao ?? [],
          },
          collapseTransacao: true,
        }));
      })
    );
  }

  envioMapa(mapa: CnEnvioMapaPayload): Observable<CnMapa> {
    return this.http
      .post<CnMapa>(`${this.targetGrupos}/${mapa.idCompraNegociacaoGrupo}/mapas/envio`, mapa)
      .pipe(
        this.refreshCabecalhoOperator(),
        this.refreshGruposOperator(mapa.idCompraNegociacaoGrupo),
        this.refreshMapaAtual(mapa.idCompraNegociacaoGrupo)
      );
  }

  updateTabs(grupo: CnGrupo, tabAtual: CnGruposTabsEnum): void {
    this.ccGruposStore.update(grupo.idCompraNegociacaoGrupo, { tabAtual });
  }

  setGrupos(idOrcamentoCenario: number, tipo: CnTipoGrupoEnum): Observable<CnGrupo[]> {
    return this._getGrupos(idOrcamentoCenario, tipo).pipe(
      tap(grupos => {
        this.ccGruposStore.setError(null);
        this._mergeGrupos(grupos, tipo);
      })
    );
  }

  setAllGrupos(idOrcamentoCenario: number): Observable<CnGrupo[]> {
    return forkJoin([
      this._getGrupos(idOrcamentoCenario, CnTipoGrupoEnum.Direto),
      this._getGrupos(idOrcamentoCenario, CnTipoGrupoEnum.Refaturado),
    ]).pipe(
      map(([gruposDireto, gruposRefaturado]) => [...gruposDireto, ...gruposRefaturado]),
      tap(grupos => {
        this.ccGruposStore.setError(null);
        this._mergeGrupos(grupos);
      })
    );
  }

  updateGrupo(idCompraNegociacaoGrupo: number, obj: Partial<CnGrupo>): void {
    this.ccGruposStore.update(idCompraNegociacaoGrupo, obj);
  }

  updateGrupoCallback(id: number, callback: UpdateStateCallback<CnGrupo>): void {
    this.ccGruposStore.update(id, callback);
  }

  toggleCollapse({
    idCompraNegociacaoGrupo,
    permitidoEmitirCcSemMapa,
    necessidadeAberturaFichaEstouro,
    grupoOrcamento,
    idOrcamentoGrupo,
    idOrcamentoCenario,
    idOrcamento,
  }: CnGrupo): Observable<boolean> {
    const requests = [];
    if (!this.ccGruposQuery.isActive(idCompraNegociacaoGrupo)) {
      if (isNil(permitidoEmitirCcSemMapa)) {
        requests.push(this.getPermissaoEmitirCcSemMapa(idCompraNegociacaoGrupo));
      }
      if (isNil(necessidadeAberturaFichaEstouro)) {
        requests.push(this.getNecessidadeAberturaFichaEstouro(idCompraNegociacaoGrupo));
      }
      if (isNil(grupoOrcamento)) {
        requests.push(this.orcamentoAltService.getGrupo(idOrcamento, idOrcamentoCenario, idOrcamentoGrupo));
      }
    }
    if (requests.length) {
      this.updateGrupo(idCompraNegociacaoGrupo, { loading: true });
    }
    return forkJoin(requests).pipe(
      defaultIfEmpty(null),
      tap(() => {
        this.toggleActive(idCompraNegociacaoGrupo);
      }),
      finalize(() => {
        if (requests.length) {
          this.updateGrupo(idCompraNegociacaoGrupo, { loading: false });
        }
      })
    );
  }

  toggleActive(idCompraNegociacaoGrupo: number): void {
    this.ccGruposStore.toggleActive(idCompraNegociacaoGrupo);
  }

  getGrupo(idCompraNegociacaoGrupo: number): Observable<CnGrupo> {
    return this.http.get<CnGrupo>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/saldo-contigencia`).pipe(
      map(grupo => ({ ...grupo, valorUtilizado: cnGetValorSaldoAtualizado(grupo) })),
      tap(grupo => {
        this.ccGruposStore.update(idCompraNegociacaoGrupo, grupo);
      })
    );
  }

  aprovarMapa(idCompraNegociacaoGrupo: number, idCompraNegociacaoGrupoMapa: number): Observable<CnMapa> {
    return this.http
      .put<CnMapa>(`${this.targetAw}/mapas/${idCompraNegociacaoGrupoMapa}/retorno`, {})
      .pipe(this.refreshGrupoOperator<CnMapa>(idCompraNegociacaoGrupo), this.refreshCabecalhoOperator<CnMapa>());
  }

  reprovarMapa(idCompraNegociacaoGrupo: number, idCompraNegociacaoGrupoMapa: number): Observable<CnMapa> {
    return this.http
      .put<CnMapa>(`${this.targetAw}/mapas/${idCompraNegociacaoGrupoMapa}/recusa`, { motivoRecusa: '.' })
      .pipe(this.refreshCabecalhoOperator<CnMapa>(), this.refreshGrupoOperator<CnMapa>(idCompraNegociacaoGrupo));
  }

  resetGruposTransferencia(idCompraNegociacaoGrupo: number): void {
    this.ccGruposStore.update(idCompraNegociacaoGrupo, grupo => ({
      ...grupo,
      gruposTransferencia: (grupo.gruposTransferencia ?? []).map(grupoTransferencia => ({
        ...grupoTransferencia,
        transferencia: 0,
      })),
      gruposTransferenciaCC: (grupo.gruposTransferenciaCC ?? []).map(grupoTransferencia => ({
        ...grupoTransferencia,
        valorTransferido: 0,
      })),
    }));
  }

  updateGrupoTransferencia(idCompraNegociacaoGrupo: number, grupo: GrupoTransferencia): void {
    this.ccGruposStore.update(idCompraNegociacaoGrupo, state => ({
      ...state,
      gruposTransferencia: arrayUpdate(
        state.gruposTransferencia,
        grupo.idCompraNegociacaoGrupo,
        grupo,
        'idCompraNegociacaoGrupo'
      ),
    }));
  }

  getConfirmacaoCompras(idCompraNegociacaoGrupo: number): Observable<CnConfirmacaoCompra> {
    const grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    return this.http
      .get<CnConfirmacaoCompraGrupo>(
        `${this.targetAw}/grupos/${idCompraNegociacaoGrupo}/confirmacao-compra-dados-grupo`
      )
      .pipe(
        map(mapCnConfirmacaoCompra),
        tap(confirmacaoCompra => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, { confirmacaoCompra });
          this._updateTabConfirmacaoCompraCCForm$.next([
            idCompraNegociacaoGrupo,
            { ...confirmacaoCompra, ...grupo.confirmacaoCompra },
          ]);
        }),
        catchAndThrow(() => {
          this._updateTabConfirmacaoCompraCCForm$.next([idCompraNegociacaoGrupo, grupo.confirmacaoCompra]);
        })
      );
  }

  getFornecedoresConfirmacaoCompra(
    idCompraNegociacaoGrupo: number,
    grupoTaxa = false,
    semMapa = false
  ): Observable<CnConfirmacaoCompraFornecedor[]> {
    const params = new AwHttpParams({ grupoTaxa, semMapa });
    return this.http
      .get<CnConfirmacaoCompraFornecedor[]>(
        `${this.targetGrupos}/${idCompraNegociacaoGrupo}/confirmacao-compra-fornecedores`,
        { params }
      )
      .pipe(
        map(cnMapConfirmacaoCompraFornecedorFactory()),
        tap(confirmacaoCompraFornecedores => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, { confirmacaoCompraFornecedores });
        })
      );
  }

  getMiscellaneousConfirmacaoCompra(idCompraNegociacaoGrupo: number): Observable<CnConfirmacaoCompraFornecedor[]> {
    return this.http
      .get<CnConfirmacaoCompraFornecedor[]>(
        `${this.targetGrupos}/${idCompraNegociacaoGrupo}/emissao-confirmacao-compra/miscellaneous`
      )
      .pipe(
        map(cnMapConfirmacaoCompraFornecedorFactory(true)),
        tap(confirmacaoCompraMiscellaneous => {
          this.updateGrupo(idCompraNegociacaoGrupo, { confirmacaoCompraMiscellaneous });
        })
      );
  }

  getRevendaConfirmacaoCompra(idCompraNegociacaoGrupo: number): Observable<CnConfirmacaoCompraFornecedor[]> {
    return this.http
      .get<CnConfirmacaoCompraFornecedor[]>(
        `${this.targetGrupos}/${idCompraNegociacaoGrupo}/emissao-confirmacao-compra/revenda`
      )
      .pipe(
        map(cnMapConfirmacaoCompraFornecedorFactory(true)),
        tap(confirmacaoCompraRevenda => {
          const confirmacaoCompraEmitidoRevenda =
            sumBy(
              confirmacaoCompraRevenda.filter(
                confirmacaoCompra => confirmacaoCompra.idCompraNegociacaoGrupoConfirmacaoCompra
              ),
              'valorTotalNegociado'
            ) ?? 0;
          this.ccGruposStore.update(idCompraNegociacaoGrupo, grupo => {
            const confirmacaoCompraSaldoRevenda = arredondamento(
              grupo.valorVendaCongelada - confirmacaoCompraEmitidoRevenda
            );
            return {
              ...grupo,
              confirmacaoCompraRevenda: confirmacaoCompraRevenda.map(confirmacaoCompra => {
                if (!confirmacaoCompra.idCompraNegociacaoGrupoConfirmacaoCompra) {
                  confirmacaoCompra = { ...confirmacaoCompra, valorTotalNegociado: confirmacaoCompraSaldoRevenda };
                }
                return confirmacaoCompra;
              }),
              confirmacaoCompraEmitidoRevenda,
              confirmacaoCompraSaldoRevenda: confirmacaoCompraSaldoRevenda < 0 ? 0 : confirmacaoCompraSaldoRevenda,
            };
          });
        })
      );
  }

  getEmitirCcDadosGrupoTaxa(idCompraNegociacaoGrupo: number, centralCompras = true): Observable<CnEmitirCc> {
    const params = new AwHttpParams({ centralCompras }, true);
    return this.http
      .get<CnEmitirCc>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/emissao-confirmacao-compra/grupo-taxa`, {
        params,
      })
      .pipe(
        map(mapCnPavimentosEmitirCc),
        tap(emitirCc => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, { emitirCc });
        })
      );
  }

  getEmitirCcDados(
    idCompraNegociacaoGrupo: number,
    idCompraNegociacaoGrupoMapaFornecedor: number
  ): Observable<CnEmitirCc> {
    return this.http
      .get<CnEmitirCc>(
        `${this.targetGrupos}/compra-negociacao-grupo-mapa-fornecedores/${idCompraNegociacaoGrupoMapaFornecedor}/emissao-confirmacao-compra`
      )
      .pipe(
        map(mapCnPavimentosEmitirCc),
        tap(emitirCc => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, { emitirCc });
        })
      );
  }

  getEmitirCcDadosMiscellaneous(
    idCompraNegociacaoGrupo: number,
    valorSaldoContingencia: number,
    valorMargemRevenda: number
  ): Observable<CnEmitirCc> {
    return this.http
      .post<CnEmitirCc>(`${this.targetGrupos}/emissao-confirmacao-compra/miscellaneous`, {
        idCompraNegociacaoGrupo,
        valorSaldoContingencia,
        valorMargemRevenda,
      })
      .pipe(
        map(mapCnPavimentosEmitirCc),
        tap(emitirCc => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, { emitirCc });
        })
      );
  }

  getEmitirCcDadosRevenda(idCompraNegociacaoGrupo: number, valorMargemRevenda: number): Observable<CnEmitirCc> {
    return this.http
      .post<CnEmitirCc>(`${this.targetGrupos}/emissao-confirmacao-compra/revenda`, {
        idCompraNegociacaoGrupo,
        valorMargemRevenda,
      })
      .pipe(
        map(mapCnPavimentosEmitirCc),
        tap(emitirCc => {
          this.updateGrupo(idCompraNegociacaoGrupo, { emitirCc });
        })
      );
  }

  getEmitirCcDadosSemMapa(idCompraNegociacaoGrupo: number): Observable<CnEmitirCc> {
    return this.http
      .get<CnEmitirCc>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/emissao-confirmacao-compra/sem-mapa`)
      .pipe(
        map(mapCnPavimentosEmitirCc),
        tap(emitirCc => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, { emitirCc });
        })
      );
  }

  updateConfirmacaoCompraFornecedor(
    idCompraNegociacaoGrupo: number,
    idCompraNegociacaoGrupoMapaFornecedor: number,
    partial: Partial<CnConfirmacaoCompraFornecedor>
  ): void {
    this.ccGruposStore.update(idCompraNegociacaoGrupo, grupo => ({
      ...grupo,
      confirmacaoCompraFornecedores: arrayUpdate(
        grupo.confirmacaoCompraFornecedores,
        idCompraNegociacaoGrupoMapaFornecedor,
        partial,
        'idCompraNegociacaoGrupoMapaFornecedor'
      ),
    }));
  }

  emitirCc(payload: CnEmitirCcPayload): Observable<CnConfirmacaoCompraFornecedor> {
    return this.http
      .post<CnConfirmacaoCompraFornecedor>(
        `${this.targetGrupos}/compra-negociacao-grupo-mapa-fornecedores/emissao-confirmacao-compra/envio`,
        payload
      )
      .pipe(
        tap(fornecedor => {
          this.updateConfirmacaoCompraFornecedor(
            payload.idCompraNegociacaoGrupo,
            payload.idCompraNegociacaoGrupoMapaFornecedor,
            fornecedor
          );
        }),
        this.refreshCabecalhoOperator<CnConfirmacaoCompraFornecedor>(),
        this.refreshGruposOperator<CnConfirmacaoCompraFornecedor>(payload.idCompraNegociacaoGrupo)
      );
  }

  emitirCcMiscellaneous(payload: CnEmitirCcPayloadMiscellaneous): Observable<CnConfirmacaoCompraFornecedor> {
    return this.http
      .post<CnConfirmacaoCompraFornecedor>(
        `${this.targetGrupos}/emissao-confirmacao-compra/miscellaneous/envio`,
        payload
      )
      .pipe(
        this.refreshCabecalhoOperator<CnConfirmacaoCompraFornecedor>(),
        this.refreshGruposOperator<CnConfirmacaoCompraFornecedor>(payload.idCompraNegociacaoGrupo),
        this.refreshFlagsOperator(payload.idCompraNegociacaoGrupo)
      );
  }

  emitirCcRevenda(payload: CnEmitirCcPayloadRevenda): Observable<CnConfirmacaoCompraFornecedor> {
    return this.http
      .post<CnConfirmacaoCompraFornecedor>(`${this.targetGrupos}/emissao-confirmacao-compra/revenda/envio`, payload)
      .pipe(
        this.refreshCabecalhoOperator(),
        this.refreshGruposOperator(payload.idCompraNegociacaoGrupo),
        this.refreshFlagsOperator(payload.idCompraNegociacaoGrupo)
      );
  }

  emitirCcSemMapa(payload: CnEmitirCcPayloadSemMapa): Observable<CnConfirmacaoCompraFornecedor> {
    return this.http
      .post<CnConfirmacaoCompraFornecedor>(
        `${this.targetGrupos}/emissao-confirmacao-compra/fornecedores-sem-mapa/envio`,
        payload
      )
      .pipe(
        this.refreshCabecalhoOperator(),
        this.refreshGruposOperator(payload.idCompraNegociacaoGrupo),
        this.refreshFlagsOperator(payload.idCompraNegociacaoGrupo)
      );
  }

  getFichas(idCompraNegociacaoGrupo: number): Observable<CnFichaAlt[]> {
    return this.http.get<CnFichaAlt[]>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/fichas`).pipe(
      map(fichas =>
        fichas.map(ficha => ({ ...ficha, tiposJoined: ficha.tipos.map(tipo => tipo.descricao).join(', ') }))
      ),
      tap(fichas => {
        this.updateGrupo(idCompraNegociacaoGrupo, { fichas });
      })
    );
  }

  enviarFicha(payload: CnFichaPayload): Observable<void> {
    return this.http
      .post<void>(`${this.targetGrupos}/${payload.idCompraNegociacaoGrupo}/fichas/envio`, payload)
      .pipe(
        this.refreshCabecalhoOperator<void>(),
        this.refreshGruposOperator<void>(payload.idCompraNegociacaoGrupo),
        this.refreshTransacoes(payload.idCompraNegociacaoGrupo)
      );
  }

  private _updateGrupoClassificacao(
    idCompraNegociacaoGrupo: number,
    classificacoes: CnClassificacao[],
    revenda = false
  ): void {
    const key: keyof Pick<CnGrupo, 'classificacoes' | 'classificacoesRevenda'> = revenda
      ? 'classificacoesRevenda'
      : 'classificacoes';
    const keyDadosGrupo: keyof Pick<CnConfirmacaoCompraDadosGrupo, 'classificacao' | 'classificacaoRevenda'> = revenda
      ? 'classificacaoRevenda'
      : 'classificacao';
    this.updateGrupoCallback(idCompraNegociacaoGrupo, state => ({
      ...state,
      [key]: classificacoes,
      confirmacaoCompra: {
        ...state.confirmacaoCompra,
        dadosGrupo: {
          ...state.confirmacaoCompra?.dadosGrupo,
          [keyDadosGrupo]:
            classificacoes.find(classificacao => classificacao.padrao && classificacao.ativo) ?? classificacoes[0],
        },
      },
    }));
    const grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    this._updateTabConfirmacaoCompraCCForm$.next([idCompraNegociacaoGrupo, grupo.confirmacaoCompra]);
  }

  getClassificacoes(idCompraNegociacaoGrupo: number): Observable<CnClassificacao[]> {
    const grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    return this.http
      .get<CnClassificacao[]>(
        `${this.targetAw}/confirmacao-compra-classificacoes/grupos-faturamento/${grupo.idOrcamentoCenarioGrupoContrato}`
      )
      .pipe(
        map(classificacoes =>
          orderBy(
            classificacoes.filter(classificacao => classificacao.grupoTaxa === grupo.grupoTaxa),
            'ordem'
          )
        ),
        tap(classificacoes => {
          this._updateGrupoClassificacao(idCompraNegociacaoGrupo, classificacoes);
        })
      );
  }

  getClassificacoesRevenda(idCompraNegociacaoGrupo: number): Observable<CnClassificacao[]> {
    return this.http.get<CnClassificacao[]>(`${this.targetAw}/confirmacao-compra-classificacoes/revenda`).pipe(
      orderByOperator('ordem'),
      tap(classificacoesRevenda => {
        this._updateGrupoClassificacao(idCompraNegociacaoGrupo, classificacoesRevenda, true);
      })
    );
  }

  getGruposTransferenciaChangeOrder(
    idOrcamentoCenario: number,
    tipo: 'direto' | 'refaturado'
  ): Observable<GrupoTransferencia[]> {
    return this.http
      .get<GrupoTransferencia[]>(`${this.targetAw}/orcamento-cenarios/${idOrcamentoCenario}/${tipo}/saldo-disponivel`)
      .pipe(orderByOperator(orderByCodigoWithoutDefinedNumberOfDots<GrupoTransferencia>('codigo')));
  }

  criarTransacaoChangeOrder(idPlanilhaHibrida: number, dto: PlanilhaHibridaTransferirSaldoDto[]): Observable<void> {
    return this.http.post<void>(
      `${this.targetGrupos}/change-order/planilhas-hibridas/${idPlanilhaHibrida}/transacoes/inclusao`,
      dto
    );
  }
  criarTransacaoChangeOrderCC(idPlanilhaHibrida: number, dto: PlanilhaHibridaTransferirSaldoCC[]): Observable<void> {
    return this.http.post<void>(
      `${this.targetGrupos}/change-order/planilhas-hibridas/${idPlanilhaHibrida}/transacoes-cc`,
      dto
    );
  }

  getTransacoesChangeOrder(idOrcamentoCenario: number): Observable<FamiliaTransacao[]> {
    return this.http
      .get<FamiliaTransacao[]>(
        `${this.targetAw}/orcamento-cenarios/${idOrcamentoCenario}/change-order/extrato-transacao`
      )
      .pipe(orderByOperator('ordemOrcamentoFamilia'));
  }

  getTransacoesChangeOrderCC(idOrcamento: number): Observable<FamiliaTransacao[]> {
    return this.http
      .get<FamiliaTransacao[]>(`${this.targetAw}/orcamentos/${idOrcamento}/change-order/extrato-transacao-cc`)
      .pipe(orderByOperator('ordemOrcamentoFamilia'));
  }

  getCCSaldoDisponivel(idOrcamento: number, idPlanilhaHibrida: number): Observable<TransferenciaCC[]> {
    return this.http
      .get<TransferenciaCC[]>(
        `${this.targetAw}/orcamentos/${idOrcamento}/planilhas-hibridas/${idPlanilhaHibrida}/confirmacoes-compra/saldo-disponivel`
      )
      .pipe(
        map(transferencias => {
          return transferencias.map(transferencia => {
            return {
              ...transferencia,
              familias: transferencia.familias.map((familia, index) => {
                return {
                  ...familia,
                  grupos: orderBy(
                    familia.grupos,
                    orderByCodigoWithoutDefinedNumberOfDots<GruposTransferenciaCC>('codigo')
                  ),
                  collapse: !index,
                };
              }),
            };
          });
        })
      );
  }

  getItensCC(
    idCompraNegociacaoGrupoConfirmacaoCompra: number,
    idPlanilhaHibrida: number
  ): Observable<GrupoConfirmacaoCompra> {
    return this.http.get<GrupoConfirmacaoCompra>(
      `${this.targetAw}/planilhas-hibridas/${idPlanilhaHibrida}/confirmacoes-compra/${idCompraNegociacaoGrupoConfirmacaoCompra}/itens/saldo-disponivel`
    );
  }

  getMigrarGrupo(idCompraNegociacaoGrupo: number): Observable<CnMigracaoGrupo> {
    return this.http.get<CnMigracaoGrupo>(`${this.targetAw}/alteracao-faturamento/grupos/${idCompraNegociacaoGrupo}`);
  }

  migrarGrupo(payload: CnMigracaoGrupoPayload, tipo: CnTipoGrupoEnum, idOrcamentoCenario: number): Observable<void> {
    return this.http
      .put<void>(`${this.targetAw}/alteracao-faturamento`, payload)
      .pipe(
        this.refreshCabecalhoOperator(),
        this.refreshAllGruposOperator(idOrcamentoCenario),
        this.refreshFlagsOperator(payload.idCompraNegociacaoGrupo)
      );
  }

  postMiscellaneous(idCompraNegociacaoGrupo: number, valor: number): Observable<void> {
    return this.http
      .post<void>(`${this.targetAw}/${idCompraNegociacaoGrupo}/miscellaneous`, { valor })
      .pipe(this.refreshCabecalhoOperator(), this.refreshGrupoOperator(idCompraNegociacaoGrupo));
  }

  getPermissaoEmitirCcSemMapa(idCompraNegociacaoGrupo: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/permissao-emitir-cc-sem-mapa`).pipe(
      tap(permitidoEmitirCcSemMapa => {
        this.updateGrupo(idCompraNegociacaoGrupo, { permitidoEmitirCcSemMapa });
      })
    );
  }

  getNecessidadeAberturaFichaEstouro(idCompraNegociacaoGrupo: number): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.targetGrupos}/${idCompraNegociacaoGrupo}/necessidade-abertura-ficha-estouro`)
      .pipe(
        tap(necessidadeAberturaFichaEstouro => {
          this.updateGrupo(idCompraNegociacaoGrupo, { necessidadeAberturaFichaEstouro });
        })
      );
  }

  getAllFlags(idCompraNegociacaoGrupo: number): Observable<boolean[]> {
    return forkJoin([
      this.getNecessidadeAberturaFichaEstouro(idCompraNegociacaoGrupo),
      this.getPermissaoEmitirCcSemMapa(idCompraNegociacaoGrupo),
    ]);
  }

  updateGrupoPlanoCompraQuestao(
    idCompraNegociacaoGrupo: number,
    idPlanoCompraQuestao: number,
    partial: Partial<PlanoCompraQuestao>
  ): void {
    this.ccGruposStore.update(idCompraNegociacaoGrupo, grupo => ({
      ...grupo,
      planoCompraQuestoes: arrayUpdate(
        grupo.planoCompraQuestoes,
        idPlanoCompraQuestao,
        partial,
        'idPlanoCompraQuestao'
      ),
    }));
  }

  getMigracaoBudgetGruposTransferencia(
    idCompraNegociacao: number,
    idCompraNegociacaoGrupo: number,
    tipo: CnTipoGrupoEnum
  ): Observable<CnMigracaoBudgetGrupo[]> {
    this.ccGruposStore.update(idCompraNegociacaoGrupo, { loadingMigracaoBudgetGruposTransferencia: true });
    return this.http
      .get<CnMigracaoBudgetGrupo[]>(
        `${this.targetAw}/${idCompraNegociacao}/grupos/${idCompraNegociacaoGrupo}/${tipo}/saldo-disponivel/migracao-budget`
      )
      .pipe(
        map(cnMapGruposTransferencia),
        tap(migracaoBudgetGruposTransferencia => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, {
            migracaoBudgetGruposTransferencia,
            loadingMigracaoBudgetGruposTransferencia: false,
          });
        }),
        catchAndThrow(() => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, { loadingMigracaoBudgetGruposTransferencia: false });
        })
      );
  }

  updateMigracaoBudgetGrupoTransferencia(
    idCompraNegociacaoGrupo: number,
    grupoTransferencia: CnMigracaoBudgetGrupo
  ): void {
    grupoTransferencia = {
      ...grupoTransferencia,
      valorSaldoUtilizado:
        (grupoTransferencia.valorSaldoContingenciaReservado === 0
          ? grupoTransferencia.valorSaldo
          : grupoTransferencia.valorSaldoContingenciaReservado) - grupoTransferencia.transferencia,
    };
    this.ccGruposStore.update(idCompraNegociacaoGrupo, grupo => ({
      ...grupo,
      migracaoBudgetGruposTransferencia: arrayUpdate(
        grupo.migracaoBudgetGruposTransferencia,
        grupoTransferencia.idCompraNegociacaoGrupo,
        grupoTransferencia,
        'idCompraNegociacaoGrupo'
      ),
    }));
  }

  getMigracaoBudgetGruposResumo(idCompraNegociacaoGrupo: number): Observable<CnMigracaoBudgetResumoResponse> {
    this.ccGruposStore.update(idCompraNegociacaoGrupo, { loadingMigracaoBudgetGruposResumo: true });
    return this.http
      .get<CnMigracaoBudgetResumoResponse>(`${this.targetAw}/grupos/${idCompraNegociacaoGrupo}/migracao-budget`)
      .pipe(
        tap(({ budgetRecebido, budgetCedido }) => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, {
            migracaoBudgetGruposResumoRecebido: cnMapMigracaoBudgetResumoGrupos(budgetRecebido, 'codigoGrupoOrigem'),
            migracaoBudgetGruposResumoCedido: cnMapMigracaoBudgetResumoGrupos(budgetCedido, 'codigoGrupo'),
            migracaoBudgetTotalRecebido: sumBy(budgetRecebido, 'valorTransferido') ?? 0,
            migracaoBudgetTotalCedido: sumBy(budgetCedido, 'valorTransferido') ?? 0,
            loadingMigracaoBudgetGruposResumo: false,
          });
        }),
        catchAndThrow(() => {
          this.ccGruposStore.update(idCompraNegociacaoGrupo, { loadingMigracaoBudgetGruposResumo: false });
        })
      );
  }

  postMigracaoBudget(
    idCompraNegociacao: number,
    tipo: CnTipoGrupoEnum,
    payload: CnMigracaoBudgetPayload
  ): Observable<void> {
    const refresh$ = [
      this.ccCabecalhoService.getCabecalho(+this.routerQuery.getParams(RouteParamEnum.idOrcamentoCenario)),
      this.getMigracaoBudgetGruposResumo(payload.idCompraNegociacaoGrupo),
      this.getMigracaoBudgetGruposTransferencia(idCompraNegociacao, payload.idCompraNegociacaoGrupo, tipo),
      this.getGrupo(payload.idCompraNegociacaoGrupo),
    ];
    for (const compraNegociacaoGrupoMigracaoBudget of payload.compraNegociacaoGrupoMigracaoBudget) {
      const grupo = this.ccGruposQuery.getEntity(compraNegociacaoGrupoMigracaoBudget.idCompraNegociacaoGrupoOrigem);
      if (grupo) {
        refresh$.push(this.getGrupo(grupo.idCompraNegociacaoGrupo));
        if (grupo.tabAtual === CnGruposTabsEnum.MigracaoBudget) {
          refresh$.push(
            this.getMigracaoBudgetGruposResumo(grupo.idCompraNegociacaoGrupo),
            this.getMigracaoBudgetGruposTransferencia(
              grupo.idCompraNegociacao,
              grupo.idCompraNegociacaoGrupo,
              grupo.tipo
            )
          );
        }
      }
    }
    return this.http.post<void>(`${this.targetAw}/migracao-budget`, payload).pipe(refreshAll(refresh$));
  }

  getGerenciarGrupos(idCompraNegociacao: number): Observable<CnGerenciarGrupo[]> {
    return this.http.get<CnGerenciarGrupo[]>(`${this.targetAw}/${idCompraNegociacao}/grupos/sem-alteracao`).pipe(
      map(grupos =>
        orderBy(
          grupos.map(grupo => ({ ...grupo, codigo: grupo.numeracao ?? grupo.codigo })),
          orderByCodigoWithoutDefinedNumberOfDots<CnGerenciarGrupo>('codigo')
        )
      )
    );
  }

  ativarGrupos(idOrcamentoCenario: number, idCompraNegociacao: number, payload: CnGerenciarGrupo[]): Observable<void> {
    return this.http
      .put<void>(`${this.targetAw}/${idCompraNegociacao}/grupos/ativacao`, payload)
      .pipe(this.refreshCabecalhoOperator(), this.refreshAllGruposOperator(idOrcamentoCenario));
  }

  updateConfirmacaoCompraRevenda(
    idCompraNegociacaoGrupo: number,
    index: number,
    partial: Partial<CnConfirmacaoCompraFornecedor>
  ): void {
    this.updateGrupoCallback(idCompraNegociacaoGrupo, grupo => ({
      ...grupo,
      confirmacaoCompraRevenda: grupo.confirmacaoCompraRevenda.map(
        (confirmacaoCompraRevenda, indexConfirmacaoCompraRevenda) => {
          if (indexConfirmacaoCompraRevenda === index) {
            confirmacaoCompraRevenda = { ...confirmacaoCompraRevenda, ...partial };
          }
          return confirmacaoCompraRevenda;
        }
      ),
    }));
  }

  private refreshMapaAtual<T>(idCompraNegociacaoGrupo: number): OperatorFunction<T, T> {
    const grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    return refresh(grupo.collapseMapa ? this.getMapaAtual(idCompraNegociacaoGrupo) : of(null));
  }

  private refreshTransacoes<T>(idCompraNegociacaoGrupo: number): OperatorFunction<T, T> {
    const grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    return refresh(grupo.collapseTransacao ? this.getExtratoTransacao(idCompraNegociacaoGrupo) : of(null));
  }

  private refreshGruposOperator<T>(idCompraNegociacaoGrupo: number): OperatorFunction<T, T> {
    const grupo = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    return refresh(this.setGrupos(grupo.idOrcamentoCenario, grupo.tipo));
  }

  private refreshAllGruposOperator<T>(idOrcamentoCenario: number): OperatorFunction<T, T> {
    return refresh(this.setAllGrupos(idOrcamentoCenario));
  }

  private refreshCabecalhoOperator<T>(): OperatorFunction<T, T> {
    return refresh(
      this.ccCabecalhoService.getCabecalho(+this.routerQuery.getParams(RouteParamEnum.idOrcamentoCenario))
    );
  }

  private refreshGrupoOperator<T>(idCompraNegociacaoGrupo: number): OperatorFunction<T, T> {
    return refresh(
      this.getGrupo(idCompraNegociacaoGrupo).pipe(
        this.refreshTransacoes(idCompraNegociacaoGrupo),
        this.refreshMapaAtual(idCompraNegociacaoGrupo)
      )
    );
  }

  private mapTotaisMapa(idCompraNegociacaoGrupo: number): OperatorFunction<CnMapa, CnMapa> {
    const { percentualImposto } = this.ccGruposQuery.getEntity(idCompraNegociacaoGrupo);
    return map(mapa => mapCnMapaTotais(percentualImposto, mapa));
  }

  private refreshFlagsOperator<T>(idCompraNegociacaoGrupo: number): MonoTypeOperatorFunction<T> {
    return refreshAll([
      this.getNecessidadeAberturaFichaEstouro(idCompraNegociacaoGrupo),
      this.getPermissaoEmitirCcSemMapa(idCompraNegociacaoGrupo),
    ]);
  }
}
