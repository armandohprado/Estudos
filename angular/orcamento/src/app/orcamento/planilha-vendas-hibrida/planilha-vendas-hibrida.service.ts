import { PhHeader } from './models/ph-header';
import { ComboImposto } from './models/combo-imposto';
import { Cenario, CenarioSimples, OrcamentoCenarioFamilia } from './models/cenario';
import { FichaCEO } from './models/ficha-ceo';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of, OperatorFunction } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ValidarComentarios } from './models/validar-comentarios';
import { TotalFamilia } from './models/total-familia';
import { CalcularFamilia } from './models/calcular-familia';
import { OrcamentoGrupo, PlanilhaHibrida, PlanilhaHibridaGrupo } from './models/grupo';
import { filter, finalize, map, pluck, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { Grupao } from './models/grupao';
import { flatten, isFunction, uniqBy } from 'lodash-es';
import { refresh, refreshAll } from '@aw-utils/rxjs/operators';
import { FamiliaTransacao } from './models/transacao';
import { CcGrupoService } from '../../compra/controle-compras/state/grupos/cc-grupo.service';
import { PlanilhaHibridaTransferirSaldoCC, PlanilhaHibridaTransferirSaldoDto } from './models/transferir-saldo';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { compareValues, orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { CenarioStatusEnum } from '../../models';
import { GrupaoGerenciar, GrupoGerenciarViewModel } from './models/gerenciar';
import { upsert } from '@aw-utils/util';
import { CenarioRetorno, CenarioRetornoResponse } from '../gerenciador-grupos/state/gerenciador-grupo.model';
import { PlanilhaVendasHibridaOpcionalService } from './planilha-vendas-hibrida-opcional.service';
import { ItensReutilizados } from './modal-itens-reutilizados/modal-itens-reutilizados.component';
import { ModalProjetoTecnico } from './models/modal-projeto-tecnico';
import { phMapGerenciadorGrupos } from './shared/gerenciar-grupos/ph-gerenciador-grupos';

@Injectable({ providedIn: 'root' })
export class PlanilhaVendasHibridaService {
  constructor(
    private http: HttpClient,
    private ccGruposService: CcGrupoService,
    private cenariosService: CenariosService,
    private planilhaVendasHibridaOpcionalService: PlanilhaVendasHibridaOpcionalService
  ) {}

  urlAPI = `${environment.AwApiUrl}planilha-vendas-hibrida`;

  hideColDesconto = true;
  hideColMargem = true;
  hideColImposto = true;
  hideColOportunidade = true;
  hideColDescontoVPDNN = true;
  editComentarioTaxaAdmFamilia = false;
  congelado = false;
  bloquearAcaoCongelar = false;
  idCenarioStatus: number;

  sticky = true;

  cenario$ = new BehaviorSubject<Cenario>(null);
  allFamilias$: Observable<OrcamentoCenarioFamilia[]> = this.cenario$.pipe(
    filter(c => !!c),
    pluck('orcamentoCenarioFamilia')
  );
  header$ = new BehaviorSubject<PhHeader>(null);
  atualizarTaxasAction$ = new BehaviorSubject<boolean>(false);
  private _validarComentarios$ = new BehaviorSubject<ValidarComentarios>(null);
  validarComentarios$ = this._validarComentarios$.asObservable();

  transacoes$ = new BehaviorSubject<FamiliaTransacao[]>([]);
  transacoesCC$ = new BehaviorSubject<FamiliaTransacao[]>([]);

  lastIdOrcamentoCenario = 0;

  getCenario(idOrcamentoCenario: number, idOrcamento: number): Observable<Cenario> {
    this.lastIdOrcamentoCenario = idOrcamentoCenario;
    const url = `${this.urlAPI}/ObterCenario/${idOrcamentoCenario}`;
    return this.http.get<Cenario>(url).pipe(
      map(data => {
        if (this.lastIdOrcamentoCenario !== idOrcamentoCenario) {
          return data;
        }
        return this.mergeCenario(this.cenario$.value, data);
      }),
      map(data => {
        return {
          ...data,
          valorTaxaAdmistrativa: data.tipoTaxaAdministrativa ? data.valorTaxaAdmistrativa : 0,
          percentualTaxaAdministrativa: data.tipoTaxaAdministrativa ? data.percentualTaxaAdministrativa : 0,
          orcamentoCenarioFamilia: data.orcamentoCenarioFamilia
            .filter(
              familia => familia.orcamentoFamilia.idFamilia !== 3 // Taxa
            )
            .map(familia => {
              return {
                ...familia,
                orcamentoFamilia: {
                  ...familia.orcamentoFamilia,
                  familia: {
                    ...familia.orcamentoFamilia.familia,
                    grupao: orderBy(
                      (familia.orcamentoFamilia.familia.grupao ?? []).map(grupao => ({ ...grupao, hasGrupos: true })),
                      'numeroGrupao'
                    ),
                  },
                },
              };
            })
            .sort((familiaA, familiaB) => {
              return compareValues(
                familiaA.orcamentoFamilia.ordemOrcamentoFamilia,
                familiaB.orcamentoFamilia.ordemOrcamentoFamilia
              );
            }),
        };
      }),
      tap(data => {
        this.cenario$.next(data);
        this.congelado = data.congelado;
      }),
      refreshAll([
        this.getHeader(idOrcamentoCenario),
        this.getAllGrupos(idOrcamentoCenario),
        this.getTransacoes(idOrcamentoCenario),
        this.getTransacoesCC(idOrcamento),
        this.getValidarCongelar(idOrcamentoCenario),
      ])
    );
  }

  private mergeCenario(oldCenario: Cenario, newCenario: Cenario): Cenario {
    const familias = upsert(
      oldCenario?.orcamentoCenarioFamilia ?? [],
      newCenario?.orcamentoCenarioFamilia ?? [],
      'idOrcamentoFamilia',
      mergeFamilia
    );
    return {
      ...oldCenario,
      ...newCenario,
      orcamentoCenarioFamilia: familias,
      tipoTaxaAdministrativa: oldCenario?.tipoTaxaAdministrativa ?? newCenario?.tipoTaxaAdministrativa ?? 0,
    };
  }

  getGrupao(
    idGrupao: number,
    idOrcamentoCenario: number,
    idOrcamentoFamilia: number,
    idOrcamentoGrupoAtivo?: number
  ): Observable<PlanilhaHibridaGrupo[]> {
    const url = `${this.urlAPI}/ObterGrupos/${idGrupao}/${idOrcamentoCenario}/orcamento-familia/${idOrcamentoFamilia}`;
    return this.http.get<PlanilhaHibridaGrupo[]>(url).pipe(
      map(grupos => grupos.map(grupo => ({ ...grupo, idOrcamentoFamilia }))),
      map(grupos => orderBy(grupos, orderByCodigo<PlanilhaHibridaGrupo>('codigoGrupo'))),
      tap(grupos => {
        this.updateGrupao(idOrcamentoFamilia, idGrupao, grupao => {
          const oldGrupos = (grupao.grupos ?? []).filter(grupo =>
            grupos.some(({ idOrcamentoGrupo }) => idOrcamentoGrupo === grupo.idOrcamentoGrupo)
          );
          let newGrupos = upsert(oldGrupos, grupos, 'idOrcamentoGrupo', mergeGrupo);
          if (idOrcamentoGrupoAtivo) {
            newGrupos = newGrupos.map(grupo => ({
              ...grupo,
              planilhaHibrida: { ...grupo.planilhaHibrida, expand: idOrcamentoGrupoAtivo === grupo.idOrcamentoGrupo },
            }));
          }
          return { ...grupao, grupos: newGrupos, hasGrupos: !!newGrupos.length };
        });
      })
    );
  }

  getListaContratos(): Observable<ComboImposto[]> {
    const url = `${this.urlAPI}/ListarContratos`;
    return this.http.get<ComboImposto[]>(url);
  }

  atualizarPlanilhaHibrida(
    idOrcamentoFamilia: number,
    idGrupao: number,
    objPlanilhaHibrida: PlanilhaHibrida,
    idOrcamento: number,
    idOrcamentoCenario: number
  ): Observable<any> {
    const url = `${this.urlAPI}/CalcularPlanilhaHibrida`;
    this.updateGrupo(idOrcamentoFamilia, idGrupao, objPlanilhaHibrida.idPlanilhaHibrida, grupo => ({
      ...grupo,
      planilhaHibrida: {
        ...grupo.planilhaHibrida,
        loading: 'loading',
        labelPercentualMargemEmbutida: false,
        labelPercentualDescontoVPDNN: false,
        labelPercentualDesconto: false,
        labelPercentualOportunidade: false,
      },
    }));
    return this.http.put(url, objPlanilhaHibrida).pipe(
      this.refreshGrupao(idGrupao, objPlanilhaHibrida.idOrcamentoCenario, idOrcamentoFamilia),
      this.refreshTaxas(),
      this.refreshCenario(idOrcamentoCenario, idOrcamento),
      finalize(() => {
        this.updateGrupo(idOrcamentoFamilia, idGrupao, objPlanilhaHibrida.idPlanilhaHibrida, grupo => ({
          ...grupo,
          planilhaHibrida: {
            ...grupo.planilhaHibrida,
            loading: 'completed',
            editComentarioOportunidade: false,
          },
        }));
      })
    );
  }

  atualizarComentarioDesconto(idPlanilha: number, comentario: string, idOrcamentoCenario: number): Observable<any> {
    const url = `${this.urlAPI}/AtualizarComentarioDesconto`;
    return this.http
      .put(url, {
        idPlanilhaHibrida: idPlanilha,
        comentarioDesconto: comentario,
      })
      .pipe(this.refreshHeader(idOrcamentoCenario), this.refreshCongelar(idOrcamentoCenario));
  }

  getCenariosGrupo(idOrcamentoGrupo: number): Observable<CenarioSimples[]> {
    return this.http
      .get<CenarioSimples[]>(`${this.urlAPI}/orcamentos-grupos/${idOrcamentoGrupo}/orcamentos-cenarios`)
      .pipe(map(cenarios => cenarios.map(cenario => ({ ...cenario, nome: cenario.nome ?? (cenario as any).Nome }))));
  }

  duplicarOrcamentoGrupo(
    idOrcamentoCenario: number,
    idOrcamentoGrupo: number,
    manterFornecedor = false,
    manterAtributos = false,
    manterQuantidades = false
  ): Observable<OrcamentoGrupo> {
    const url = `${this.urlAPI}/orcamentos-cenarios/${idOrcamentoCenario}/orcamentos-grupos/${idOrcamentoGrupo}/duplicacao/${manterFornecedor}/${manterAtributos}/${manterQuantidades}`;
    return this.http.put<OrcamentoGrupo>(url, undefined);
  }

  toggleAtivoOrcamentoCenarioGrupo(idOrcamentoCenarioGrupo: number): Observable<CenarioRetorno[]> {
    return this.http
      .put<CenarioRetornoResponse[]>(
        `${this.urlAPI}/orcamentos-cenarios-grupos/${idOrcamentoCenarioGrupo}/ativacao`,
        undefined
      )
      .pipe(map(cenarios => cenarios.map(({ nomeGrupo, codigoGrupo, ...cenario }) => ({ ...cenario }))));
  }

  getHeader(idOrcamentoCenario: number): Observable<PhHeader> {
    const url = `${this.urlAPI}/ObterTotalizadorCenario/${idOrcamentoCenario}`;
    return this.http.get<PhHeader>(url).pipe(
      tap(header => {
        this.header$.next({ ...this.header$.value, ...header });
      })
    );
  }

  getTotalFamilia(idOrcamentoCenarioFamilia: number, idOrcamentoCenario: number): Observable<TotalFamilia> {
    const url = `${this.urlAPI}/ObterTotalFamilia/${idOrcamentoCenarioFamilia}/${idOrcamentoCenario}`;
    return this.http.get<TotalFamilia>(url).pipe(
      tap(totalFamilia => {
        const idOrcamentoFamilia = this.cenario$.value.orcamentoCenarioFamilia.find(
          o => o.idOrcamentoCenarioFamilia === idOrcamentoCenarioFamilia
        )?.idOrcamentoFamilia;
        if (idOrcamentoFamilia) {
          this.updateFamilia(idOrcamentoFamilia, familia => {
            return {
              ...familia,
              valorTotal: totalFamilia.valorTotalFamilia,
              orcamentoFamilia: {
                ...familia.orcamentoFamilia,
                familia: {
                  ...familia.orcamentoFamilia.familia,
                  valorTotalFamilia: totalFamilia.valorTotalFamilia,
                },
              },
            };
          });
        }
      })
    );
  }

  getInfoFichaCEO(idOrcamentoCenario: number): Observable<FichaCEO> {
    const url = `${this.urlAPI}/ObterFichaCEO/${idOrcamentoCenario}`;
    return this.http.get<FichaCEO>(url);
  }

  salvarFichaCEO(objFichaCEO: FichaCEO, idOrcamentoCenario: number): Observable<any> {
    const url = `${this.urlAPI}/AtualizarFichaCEO/${idOrcamentoCenario}`;
    return this.http.put(url, objFichaCEO).pipe(this.refreshHeader(idOrcamentoCenario));
  }

  getModalProjetoTecnico(idOrcamentoCenario: number): Observable<ModalProjetoTecnico[]> {
    const url = `${this.urlAPI}/orcamento-cenarios/${idOrcamentoCenario}/grupos/projeto-tecnico`;
    return this.http.get<ModalProjetoTecnico[]>(url);
  }

  putModalProjetoTecnico(
    idOrcamentoCenario: number,
    idOrcamentoCenarioGrupo: number,
    classificacao: number
  ): Observable<void> {
    const url = `${this.urlAPI}/orcamento-cenarios/${idOrcamentoCenario}/grupos/${idOrcamentoCenarioGrupo}/projeto-tecnico`;
    return this.http.put<void>(url, { classificacao });
  }

  getModalItensReutilizados(idOrcamentoCenario: number): Observable<ItensReutilizados[]> {
    const url = `${this.urlAPI}/orcamento-cenarios/${idOrcamentoCenario}/itens-reutilizados`;
    return this.http.get<ItensReutilizados[]>(url);
  }

  putModalItensReutilizados(
    idOrcamentoCenario: number,
    itemReutilizado: ItensReutilizados
  ): Observable<ItensReutilizados> {
    if (!itemReutilizado.reutilizado) {
      itemReutilizado.justificativa = '';
    }
    const url = `${this.urlAPI}/orcamento-cenarios/${idOrcamentoCenario}/itens-reutilizados/${itemReutilizado.idOrcamentoCenarioItemReutilizado}`;
    return this.http.put<ItensReutilizados>(url, itemReutilizado);
  }

  calcularFamilia(
    objFamiliaFooter: TotalFamilia,
    idOrcamento: number,
    refreshCenario = true
  ): Observable<CalcularFamilia> {
    const url = `${this.urlAPI}/CalcularFamilia`;
    let http$ = this.http
      .put<CalcularFamilia>(url, objFamiliaFooter)
      .pipe(this.refreshTotalFamilia(objFamiliaFooter.idOrcamentoCenarioFamilia, objFamiliaFooter.idOrcamentoCenario));
    if (refreshCenario) {
      http$ = http$.pipe(this.refreshCenario(objFamiliaFooter.idOrcamentoCenario, idOrcamento));
    } else {
      http$ = http$.pipe(
        refreshAll([
          this.getTransacoes(objFamiliaFooter.idOrcamentoCenario),
          this.getTransacoesCC(idOrcamento),
          this.getHeader(objFamiliaFooter.idOrcamentoCenario),
        ])
      );
    }
    return http$;
  }

  calcularColunasPlanilha(
    idOrcamentoFamilia: number,
    idGrupao: number,
    objHeaderFamilia: TotalFamilia,
    idOrcamento: number
  ): Observable<any> {
    const url = `${this.urlAPI}/CalcularColunasPlanilhaHibrida`;
    return this.http
      .put(url, objHeaderFamilia)
      .pipe(this.refreshTaxas(), this.refreshCenario(objHeaderFamilia.idOrcamentoCenario, idOrcamento));
  }

  gravarTaxaBensServicos(objTaxas: Cenario): Observable<Cenario> {
    const url = `${this.urlAPI}/GravarTaxaBemsServicos`;
    return this.http
      .put<Cenario>(url, objTaxas)
      .pipe(this.refreshCenario(objTaxas.idOrcamentoCenario, objTaxas.idOrcamento));
  }

  gravarTaxasAdministrativa(objTaxas: Cenario): Observable<Cenario> {
    const url = `${this.urlAPI}/GravarTaxasAdministrativa`;
    return this.http
      .put<Cenario>(url, objTaxas)
      .pipe(
        this.refreshCenario(objTaxas.idOrcamentoCenario, objTaxas.idOrcamento),
        this.refreshCenarioOpcional(objTaxas.idOrcamentoCenario)
      );
  }

  zerarTaxaAdminFixa(cenario: Cenario): Observable<Cenario> {
    return this.http
      .put<Cenario>(`${this.urlAPI}/GravarTaxasAdministrativa`, {
        ...cenario,
        valorTaxaAdmistrativa: 0,
        percentualTaxaAdministrativa: 0,
      } as Cenario)
      .pipe(this.refreshHeader(cenario.idOrcamentoCenario), this.refreshCenarioOpcional(cenario.idOrcamentoCenario));
  }

  zerarTaxaAdminFamilias(idOrcamentoCenario: number, idOrcamento: number): Observable<CalcularFamilia[]> {
    const total = this.cenario$.value.orcamentoCenarioFamilia.map(familia =>
      this.getTotalFamilia(familia.idOrcamentoCenarioFamilia, idOrcamentoCenario)
    );
    return forkJoin(total)
      .pipe(
        switchMap(familiasTotal => {
          const familiasWithTaxa = familiasTotal.filter(t => t.valorTaxaAdm > 0 || t.percentualTaxaAdm > 0);
          if (!familiasWithTaxa.length) {
            return of([]);
          }
          const reqs$ = familiasWithTaxa.map(t =>
            this.calcularFamilia({ ...t, valorTaxaAdm: 0, percentualTaxaAdm: 0 }, idOrcamento, false)
          );
          return forkJoin(reqs$);
        })
      )
      .pipe(
        refreshAll([
          this.getHeader(idOrcamentoCenario),
          this.getTransacoes(idOrcamentoCenario),
          this.getTransacoesCC(idOrcamento),
        ]),
        this.refreshFamiliaGruposOpcionais(idOrcamentoCenario),
        this.refreshTaxas()
      );
  }

  congelarPlanilha(idOrcamento: number, idOrcamentoCenario: number, idNaturezaProjeto: number): Observable<any> {
    const url = `${this.urlAPI}/congelamentoCenario/${idOrcamentoCenario}`;
    return this.http
      .put(url, { idNaturezaProjeto })
      .pipe(
        switchMapTo(this.cenariosService.alterarStatus(idOrcamento, idOrcamentoCenario, CenarioStatusEnum.congelado))
      );
  }

  getValidarCongelar(idOrcamentoCenario: number): Observable<ValidarComentarios> {
    const url = `${this.urlAPI}/ValidacaoComentarios/${idOrcamentoCenario}`;
    return this.http.get<ValidarComentarios>(url).pipe(
      map(validarComentarios => ({
        ...validarComentarios,
        grupos: uniqBy(
          [...validarComentarios.quantidadeOportunidade, ...validarComentarios.quantidadeDesconto].filter(
            grupo => !grupo.grupoOpcional
          ),
          'idGrupo'
        ),
        gruposOpcionais: uniqBy(
          [...validarComentarios.quantidadeOportunidade, ...validarComentarios.quantidadeDesconto].filter(
            grupo => grupo.grupoOpcional
          ),
          'idGrupo'
        ),
      })),
      tap(validar => {
        this._validarComentarios$.next(validar);
        this.bloquearAcaoCongelar = !!validar.grupos.length;
      })
    );
  }

  baseFornecedor(idPlanilhaHibrida: number, baseFornecedor: boolean, idOrcamentoCenario: number): Observable<void> {
    const params = new HttpParams({
      fromObject: {
        baseFornecedor: '' + baseFornecedor,
      },
    });
    return this.http
      .put<void>(`${this.urlAPI}/${idPlanilhaHibrida}/base-fornecedor`, undefined, {
        params,
      })
      .pipe(this.refreshHeader(idOrcamentoCenario));
  }

  transferencia(
    idPlanilhaHibrida: number,
    dto: PlanilhaHibridaTransferirSaldoDto[],
    idOrcamentoFamilia: number,
    idGrupao: number,
    idOrcamentoCenario: number,
    idOrcamento: number
  ): Observable<void> {
    return this.ccGruposService
      .criarTransacaoChangeOrder(idPlanilhaHibrida, dto)
      .pipe(
        this.refreshCenario(idOrcamentoCenario, idOrcamento),
        this.refreshGrupao(idOrcamentoFamilia, idGrupao, idOrcamentoCenario),
        this.refreshTaxas()
      );
  }

  transferenciaCC(
    planilhaHibridaGrupo: PlanilhaHibridaGrupo,
    payload: PlanilhaHibridaTransferirSaldoCC[],
    idOrcamento: number
  ): Observable<void> {
    return this.ccGruposService
      .criarTransacaoChangeOrderCC(planilhaHibridaGrupo.planilhaHibrida.idPlanilhaHibrida, payload)
      .pipe(
        this.refreshCenario(planilhaHibridaGrupo.idOrcamentoCenario, idOrcamento),
        this.refreshGrupao(
          planilhaHibridaGrupo.idOrcamentoFamilia,
          planilhaHibridaGrupo.idGrupao,
          planilhaHibridaGrupo.idOrcamentoCenario
        ),
        this.refreshTaxas()
      );
  }

  destroyState(): void {
    this.hideColDesconto = true;
    this.hideColMargem = true;
    this.hideColImposto = true;
    this.hideColOportunidade = true;
    this.hideColDescontoVPDNN = true;
    this.editComentarioTaxaAdmFamilia = false;
    this.congelado = false;
    this.bloquearAcaoCongelar = false;
    this.cenario$.next(null);
    this.header$.next(null);
    this.transacoes$.next([]);
  }

  private refreshGrupao<T>(
    idOrcamentoFamilia: number,
    idGrupao: number,
    idOrcamentoCenario: number
  ): OperatorFunction<T, T> {
    return refresh(this.getGrupao(idGrupao, idOrcamentoCenario, idOrcamentoFamilia));
  }

  private getTransacoes(idOrcamentoCenario: number): Observable<FamiliaTransacao[]> {
    return this.ccGruposService.getTransacoesChangeOrder(idOrcamentoCenario).pipe(
      tap(familias => {
        this.transacoes$.next(familias);
      })
    );
  }

  private refreshTransacoes<T>(idOrcamentoCenario: number): OperatorFunction<T, T> {
    return refresh(this.getTransacoes(idOrcamentoCenario));
  }

  private getTransacoesCC(idOrcamento: number): Observable<FamiliaTransacao[]> {
    return this.ccGruposService.getTransacoesChangeOrderCC(idOrcamento).pipe(
      tap(familias => {
        this.transacoesCC$.next(familias);
      })
    );
  }

  private refreshTransacoesCC<T>(idOrcamento: number): OperatorFunction<T, T> {
    return refresh(this.getTransacoesCC(idOrcamento));
  }

  private refreshHeader<T>(idOrcamentoCenario: number): OperatorFunction<T, T> {
    return refresh(this.getHeader(idOrcamentoCenario));
  }

  refreshTaxas<T>(): OperatorFunction<T, T> {
    return tap(() => {
      this.atualizarTaxasAction$.next(true);
    });
  }

  private refreshCongelar<T>(idOrcamentoCenario: number): OperatorFunction<T, T> {
    return refresh(this.getValidarCongelar(idOrcamentoCenario));
  }
  private refreshFamiliaGruposOpcionais<T>(idOrcamentoCenario: number): OperatorFunction<T, T> {
    return refresh(this.planilhaVendasHibridaOpcionalService.getFamiliaGruposOpcionais(idOrcamentoCenario));
  }

  private getAllGrupos(idOrcamentoCenario: number): Observable<PlanilhaHibridaGrupo[][]> {
    const familias = this.cenario$.value?.orcamentoCenarioFamilia.filter(familia => familia.isOpen) ?? [];
    if (!familias.length) {
      return of([]);
    }
    const reqs$ = flatten(
      familias.map(familia =>
        familia.orcamentoFamilia.familia.grupao.map(grupao =>
          this.getGrupao(grupao.idGrupao, idOrcamentoCenario, familia.idOrcamentoFamilia)
        )
      )
    );
    return forkJoin(reqs$);
  }

  private refreshAllGrupos<T>(idOrcamentoCenario: number): OperatorFunction<T, T> {
    return refresh(this.getAllGrupos(idOrcamentoCenario));
  }

  private refreshCenario<T>(idOrcamentoCenario: number, idOrcamento: number): OperatorFunction<T, T> {
    return refresh(this.getCenario(idOrcamentoCenario, idOrcamento));
  }
  private refreshCenarioOpcional<T>(idOrcamentoCenario: number): OperatorFunction<T, T> {
    return refresh(this.planilhaVendasHibridaOpcionalService.getTaxasGrupaoOpcional(idOrcamentoCenario));
  }

  refreshTotalFamilia<T>(idOrcamentoCenarioFamilia: number, idOrcamentoCenario: number): OperatorFunction<T, T> {
    return refresh(this.getTotalFamilia(idOrcamentoCenarioFamilia, idOrcamentoCenario));
  }

  updateCenario(cenario: Partial<Cenario>): void {
    this.cenario$.next({ ...this.cenario$.value, ...cenario });
  }

  updateFamilia(
    idOrcamentoFamilia: number | ((familia: OrcamentoCenarioFamilia) => boolean),
    partial: Partial<OrcamentoCenarioFamilia> | ((familia: OrcamentoCenarioFamilia) => OrcamentoCenarioFamilia)
  ): void {
    const predicate = isFunction(idOrcamentoFamilia)
      ? idOrcamentoFamilia
      : (familia: OrcamentoCenarioFamilia) => familia.idOrcamentoFamilia === idOrcamentoFamilia;
    const callback = isFunction(partial) ? partial : oldFamilia => ({ ...oldFamilia, ...partial });
    const currentState = this.cenario$.value;
    this.cenario$.next({
      ...currentState,
      orcamentoCenarioFamilia: currentState.orcamentoCenarioFamilia.map(familia => {
        if (predicate(familia)) {
          return callback(familia);
        }
        return familia;
      }),
    });
  }

  updateGrupo(
    idOrcamentoFamilia: number,
    idGrupao: number,
    idPlanilhaHibrida: number,
    partial: Partial<PlanilhaHibridaGrupo> | ((grupo: PlanilhaHibridaGrupo) => PlanilhaHibridaGrupo)
  ): void {
    const callback = isFunction(partial) ? partial : g => ({ ...g, ...partial });
    this.updateGrupao(idOrcamentoFamilia, idGrupao, grupao => {
      return {
        ...grupao,
        grupos: grupao.grupos.map(grupo => {
          if (grupo.planilhaHibrida.idPlanilhaHibrida === idPlanilhaHibrida) {
            return callback(grupo);
          }
          return grupo;
        }),
      };
    });
  }

  updateGrupao(
    idOrcamentoFamilia: number,
    idGrupao: number,
    partial: Partial<Grupao> | ((grupao: Grupao) => Grupao)
  ): void {
    const callback = isFunction(partial) ? partial : g => ({ ...g, ...partial });
    this.updateFamilia(idOrcamentoFamilia, familia => {
      return {
        ...familia,
        orcamentoFamilia: {
          ...familia.orcamentoFamilia,
          familia: {
            ...familia.orcamentoFamilia.familia,
            grupao: (familia.orcamentoFamilia.familia.grupao ?? []).map(grupao => {
              if (grupao.idGrupao === idGrupao) {
                return callback(grupao);
              }
              return grupao;
            }),
          },
        },
      };
    });
  }

  getGrupoesGerenciar(idOrcamentoCenarioFamilia: number): Observable<GrupaoGerenciar[]> {
    return this.http
      .get<GrupoGerenciarViewModel[]>(
        `${this.urlAPI}/orcamentos-cenarios-familias/${idOrcamentoCenarioFamilia}/orcamentos-grupos`
      )
      .pipe(map(phMapGerenciadorGrupos));
  }

  atualizarBaseCalculoCenario(idOrcamentoCenario: number): Observable<boolean> {
    const url = `${this.urlAPI}/orcamento-cenarios/${idOrcamentoCenario}/taxa-em-percentual`;
    return this.http.put<boolean>(url, undefined);
  }

  atualizarBaseCalculoFamilia(idOrcamentoCenarioFamilia: number): Observable<boolean> {
    const url = `${this.urlAPI}/orcamento-cenarios-familia/${idOrcamentoCenarioFamilia}/taxa-em-percentual`;
    return this.http.put<boolean>(url, undefined);
  }
}

function mergeFamilia(familiaA: OrcamentoCenarioFamilia, familiaB: OrcamentoCenarioFamilia): OrcamentoCenarioFamilia {
  return {
    ...familiaA,
    ...familiaB,
    orcamentoFamilia: {
      ...familiaA?.orcamentoFamilia,
      ...familiaB?.orcamentoFamilia,
      familia: {
        ...familiaA?.orcamentoFamilia?.familia,
        ...familiaB?.orcamentoFamilia?.familia,
        grupao: upsert(
          familiaA?.orcamentoFamilia?.familia?.grupao ?? [],
          familiaB?.orcamentoFamilia?.familia?.grupao ?? [],
          'idGrupao',
          mergeGrupao
        ),
      },
    },
  };
}

function mergeGrupao(grupaoA: Grupao, grupaoB: Grupao): Grupao {
  return {
    ...grupaoA,
    ...grupaoB,
    grupos: upsert(grupaoA?.grupos ?? [], grupaoB?.grupos ?? [], 'idOrcamentoGrupo', mergeGrupo),
  };
}

function mergeGrupo(grupoA: PlanilhaHibridaGrupo, grupoB: PlanilhaHibridaGrupo): PlanilhaHibridaGrupo {
  return {
    ...grupoA,
    ...grupoB,
    planilhaHibrida: {
      ...grupoA?.planilhaHibrida,
      ...grupoB?.planilhaHibrida,
    },
  };
}
