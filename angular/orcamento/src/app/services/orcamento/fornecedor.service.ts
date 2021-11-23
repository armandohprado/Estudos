import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ContatoAlt, Fornecedor, SituacaoFornecedor } from '../../models';
import { environment } from '../../../environments/environment';
import { convertObservableToBehaviorSubject } from '@aw-utils/convertObservableToBehaviorSubject';
import { filter, finalize, map, switchMap } from 'rxjs/operators';
import { AwHttpParams } from '@aw-utils/http-params';
import { orderByOperator } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { FornecedorFichaPayload } from '../../compra/models/cn-ficha-payload';

export interface IFornecedoresFiltros {
  idOrcamento: number;
  idGrupo: number;
  idOrcamentoGrupo: number;
  situacao: SituacaoFornecedor;
  selecionados?: Fornecedor[];
  busca?: string;
  tipo?: string;
}

export type TipoBuscaFornecedor = 'cnpj' | 'nome';

@Injectable({ providedIn: 'root' })
export class FornecedorService {
  constructor(private http: HttpClient) {}

  static idFornecedorAw = 10576;
  static idFornecedorAwEstimado = 32670;

  private _loadingFornecedores$ = new BehaviorSubject<boolean>(false);
  loadingFornecedores$ = this._loadingFornecedores$.asObservable();

  fornecedoresFilters$: BehaviorSubject<IFornecedoresFiltros> = new BehaviorSubject<IFornecedoresFiltros>(null);

  fornecedores$ = convertObservableToBehaviorSubject(
    this.fornecedoresFilters$.pipe(
      filter(f => !!f),
      switchMap(filtros => {
        this._loadingFornecedores$.next(true);
        return this.getFornecedores(filtros).pipe(
          map(fornecedores => [filtros, fornecedores] as [IFornecedoresFiltros, Fornecedor[]]),
          finalize(() => {
            this._loadingFornecedores$.next(false);
          })
        );
      }),
      map(([filtros, fornecedores]) => {
        const homologados = fornecedores.filter(fornecedor => !fornecedor.fornecedorInterno);
        if (filtros.selecionados?.length) {
          const grupo = this.fornecedoresFilters$.value.selecionados.filter(
            fornecedor => !fornecedor.fornecedorInterno
          );
          let lista = [];

          lista = grupo;

          homologados.forEach(fornecedor => {
            const matchFornecedores = grupo.find((item: Fornecedor) => item.idFornecedor === fornecedor.idFornecedor);

            if (!matchFornecedores) {
              lista.push(fornecedor);
            }
          });
          return lista;
        }
        return homologados;
      })
    )
  );

  enviarFicha(payload: FornecedorFichaPayload): Observable<void> {
    return this.http.post<void>(`${environment.AwApiUrl}fornecedor/fichas/envio`, payload);
  }

  getFornecedores(filtros: IFornecedoresFiltros): Observable<Fornecedor[]> {
    const { situacao, idOrcamento, idOrcamentoGrupo, idGrupo, busca, tipo } = filtros;

    let params = new HttpParams().set('situacaoFornecedorEnum', '' + situacao);

    if (!!(busca && tipo)) {
      params = params.set('tipo', tipo);
      params = params.set('busca', busca);
    }

    return this.http
      .get<Fornecedor[]>(
        `${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${idGrupo}/orcamento-grupos/${idOrcamentoGrupo}/fornecedores`,
        { params }
      )
      .pipe(
        map(fornecedores =>
          fornecedores.map(fornecedor => ({
            ...fornecedor,
            isDisabled: fornecedor.desomologado,
            liberaCotacao: !!fornecedor.idLiberaCotacao,
          }))
        ),
        orderByOperator('nomeFantasia')
      );
  }

  addFornecedoresGrupo(
    idOrcamento: number,
    idGrupo: number,
    idOrcamentoGrupo: number,
    fornecedores: Fornecedor[]
  ): Observable<Fornecedor[]> {
    return this.http.post<Fornecedor[]>(
      `${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${idGrupo}/orcamento-grupos/${idOrcamentoGrupo}/fornecedores`,
      fornecedores
    );
  }

  updateFornecedorGrupo(
    idOrcamento: number,
    idGrupo: number,
    idOrcamentoGrupo: number,
    fornecedor: Fornecedor
  ): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(
      `${environment.ApiUrl}orcamentos/${idOrcamento}/grupos/${idGrupo}/orcamento-grupos/${idOrcamentoGrupo}/fornecedores`,
      fornecedor
    );
  }

  removeFornecedorGrupoCompra(IdOrcamentoGrupoFornecedor: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.AwApiUrl}/fornecedor/grupo-fornecedor/grupo/${IdOrcamentoGrupoFornecedor}/remover`
    );
  }

  addFornecedorGrupoCompra(idOrcamentoGrupo: number, fornecedor: Fornecedor): Observable<number> {
    return this.http.post<number>(`${environment.AwApiUrl}/fornecedor/grupo-fornecedor/adcionar`, {
      ...fornecedor,
      idOrcamentoGrupo,
    });
  }

  getContatos(idFornecedor: number): Observable<ContatoAlt[]> {
    return this.http.get<ContatoAlt[]>(`${environment.AwApiUrl}/fornecedor/${idFornecedor}/contatos`);
  }

  getFornecedoresByTerm2(tipo: TipoBuscaFornecedor, busca: string): Observable<Fornecedor[]> {
    const params = new AwHttpParams({ tipo, busca });
    return this.http.get<Fornecedor[]>(`${environment.AwApiUrl}fornecedor`, { params });
  }
}
