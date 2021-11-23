import { Injectable } from '@angular/core';
import { GrupoAlt, OrcamentoCenarioPadrao } from '../../models';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { DefinicaoEscopoLojaInsumoActions } from './state/actions';
import { DefinicaoEscopoService } from '../definicao-escopo/definicao-escopo.service';
import { forkJoin, Observable } from 'rxjs';
import {
  GrupoItemDELI,
  GrupoItemDELIFilho,
  GrupoItemDELIID,
  KeyofGrupoItemDELI,
  KeyofGrupoItemDELIFilho,
} from './models/grupo-item';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { map } from 'rxjs/operators';
import { InclusaoGrupoItem } from '../definicao-escopo/model/inclusao-grupo-item';
import { DuplicarGrupoItem } from '../definicao-escopo/model/duplicar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  FiltroProdutoCatalogo,
  ProdutoCatalogo,
  ProdutoCatalogoGenericResponse,
  ProdutoCatalogoPayload,
  ProdutoCatalogoVariacaoPayload,
  ProdutoCatalogoVariacoesResponse,
} from './models/produto-catalogo';
import { GenericResponse } from '../definicao-escopo/model/generic-response';
import { Pavimento } from '../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { CentroCusto } from '../definicao-escopo/shared/de-distribuir-quantitativo/model/centro-custo';
import { GrupoItem, GrupoItemFilho, GrupoItemGenericReponse } from '../definicao-escopo/model/grupo-item';
import { StateOperator } from '@ngxs/store';
import { DefinicaoEscopoLojaService } from '../definicao-escopo-loja/definicao-escopo-loja.service';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { orderByCodigoWithoutDefinedNumberOfDots } from '@aw-utils/grupo-item/sort-by-numeracao';
import { AwHttpParams } from '@aw-utils/http-params';

@Injectable({ providedIn: 'root' })
export class DefinicaoEscopoLojaInsumoService {
  constructor(
    public definicaoEscopoService: DefinicaoEscopoService,
    public definicaoEscopoLojaService: DefinicaoEscopoLojaService,
    private http: HttpClient
  ) {}

  target = environment.AwApiUrl + 'definicao-escopo-loja';
  targetOrcamentoGrupo = environment.AwApiUrl + 'v2/grupos/orcamento-grupo';
  targetOrcamentoGrupoItem = environment.AwApiUrl + 'v2/orcamento-grupo-itens';
  targetGrupoOrcamentoGrupoItem = environment.AwApiUrl + 'v2/grupos/orcamento-grupo-item';
  targetV2 = this.target + '/v2';
  targetProdutoCatalogo = this.targetV2 + '/produto-catalogo';

  grupo: GrupoAlt;
  cenarioPadrao: OrcamentoCenarioPadrao;
  idOrcamentoCenario: number;

  setInit(grupo: GrupoAlt, cenarioPadrao: OrcamentoCenarioPadrao, idOrcamentoCenario: number): void {
    this.grupo = grupo;
    this.cenarioPadrao = cenarioPadrao;
    this.idOrcamentoCenario = idOrcamentoCenario;
    this.setGrupoItensApi(this.grupo.idOrcamentoGrupo);
  }

  clear(): void {
    this.cenarioPadrao = null;
    this.grupo = null;
    this.idOrcamentoCenario = null;
    this.clearState();
  }

  getGruposItens<T extends GrupoItem>(idOrcamentoGrupo: number): Observable<T[]> {
    return this.http.get<T[]>(`${this.targetOrcamentoGrupo}/${idOrcamentoGrupo}/grupo-itens`).pipe(
      map(grupoItens =>
        grupoItens.map(grupoItem => {
          grupoItem.tag = grupoItem.tag ?? null;
          grupoItem.statusProperty = {};
          grupoItem.editingProperty = {};
          grupoItem.valorUnitarioProdutoReferencia = grupoItem.valorUnitarioProdutoReferencia ?? 0;
          grupoItem.quantidadeTotal = grupoItem.quantidadeTotal ?? 0;
          return grupoItem;
        })
      )
    );
  }

  getGrupoItemFilhos<T extends GrupoItemFilho>(idOrcamentoGrupoItem: number, idGrupoItem: number): Observable<T[]> {
    return this.http
      .get<T[]>(`${this.targetGrupoOrcamentoGrupoItem}/${idOrcamentoGrupoItem}/grupo-itens/${idGrupoItem}`)
      .pipe(
        map(filhos =>
          filhos.map(filho => ({
            ...filho,
            statusProperty: {},
            filtros: [],
            term: '',
            // Se precisar dessa numeracao, vai ter que mudar o orderByNumeracaoFilho ;)
            numeracao: null,
            numeracaoGrupoItem: filho.numeracaoGrupoItem ?? filho.numeracao,
          }))
        ),
        map(filhos =>
          orderBy(filhos, orderByCodigoWithoutDefinedNumberOfDots<GrupoItemDELIFilho>('numeracaoGrupoItem'))
        )
      );
  }

  getProdutoVariacoes(idGrupoItem: number, idProduto: number): Observable<ProdutoCatalogoVariacoesResponse> {
    return this.http
      .get<ProdutoCatalogoVariacoesResponse>(
        `${this.targetProdutoCatalogo}/${idGrupoItem}/produto/${idProduto}/variacoes`
      )
      .pipe(
        map(response => ({
          ...response,
          variacoes: response.variacoes
            // "back-end + 1 problem"
            // por algum motivo obscuro, o back-end disse que não consegue mandar
            // o número começando no 1 (continua no "back-end + 1 problem continuacao")
            .map(v => ({ ...v, optionNumber: v.optionNumber + 1 }))
            .map(v => {
              return {
                ...v,
                valoresCustom: v.valores.map(o => ({
                  valor: o,
                  active: false,
                })),
                disabled: v.optionNumber > 1,
              };
            }),
        }))
      );
  }

  getProdutoByVariacao(idProduto: number, payload: ProdutoCatalogoVariacaoPayload[]): Observable<ProdutoCatalogo> {
    return this.http.post<ProdutoCatalogo>(`${this.targetProdutoCatalogo}/${idProduto}`, payload);
  }

  incluirGrupoItem(grupoItem: InclusaoGrupoItem): Observable<GrupoItemGenericReponse> {
    return this.http.post<GrupoItemGenericReponse>(`${this.targetOrcamentoGrupoItem}/inclusao`, grupoItem).pipe(
      map(response => {
        if (!response.responseMessage.erro) {
          response.orcamentoGrupoItem = {
            ...response.orcamentoGrupoItem,
            quantidadeTotal:
              (response.orcamentoGrupoItem as any).quantidade ?? response.orcamentoGrupoItem.quantidadeTotal ?? 0,
          };
        }
        return response;
      })
    );
  }

  excluirGrupoItem(idOrcamentoGrupoItem: number, idOrcamentoCenario: number, forcarExclusao = false): Observable<void> {
    const params = new AwHttpParams({ forcarExclusao });
    return this.http
      .delete<GenericResponse>(
        `${this.targetOrcamentoGrupoItem}/${idOrcamentoGrupoItem}/cenario/${idOrcamentoCenario}/exclusao`,
        { params }
      )
      .pipe(
        map(response => {
          if (response.codigo === 2) {
            throw response;
          }
          return;
        })
      );
  }

  duplicarGrupoItem(dto: DuplicarGrupoItem): Observable<GrupoItemGenericReponse> {
    return this.http.post<GrupoItemGenericReponse>(`${this.targetOrcamentoGrupoItem}/duplicacao`, dto);
  }

  getProdutosAssociados(idOrcamentoGrupoItem: number): Observable<ProdutoCatalogo[]> {
    return this.http
      .get<ProdutoCatalogo[]>(`${this.targetV2}/orcamento-grupo-itens/${idOrcamentoGrupoItem}`)
      .pipe(map(produtos => produtos ?? []));
  }

  getProdutos(idGrupoItem: number): Observable<ProdutoCatalogo[]> {
    return this.http
      .get<ProdutoCatalogo[]>(`${this.targetV2}/grupo-itens/${idGrupoItem}`)
      .pipe(map(produtos => produtos ?? []));
  }

  getAllProdutos(
    idGrupoItem: number,
    idOrcamentoGrupoItem: number
  ): Observable<[ProdutoCatalogo[], ProdutoCatalogo[]]> {
    return forkJoin([this.getProdutos(idGrupoItem), this.getProdutosAssociados(idOrcamentoGrupoItem)]).pipe(
      map(arr => {
        arr[0] = arr[0].map(cat => {
          const produtoSelecionado = arr[1].find(prod => prod.idProdutoCatalogo === cat.idProdutoCatalogo);
          return {
            ...cat,
            ...produtoSelecionado,
            selecionadoCatalogo: !!produtoSelecionado,
          };
        });
        return arr;
      })
    );
  }

  putProduto(idOrcamentoGrupoItem: number, payload: ProdutoCatalogoPayload): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
      `${this.targetV2}/orcamento-grupo-itens/${idOrcamentoGrupoItem}/produto-catalogo/atualizacao`,
      payload
    );
  }

  postProduto(
    idOrcamentoGrupoItem: number,
    payload: ProdutoCatalogoPayload
  ): Observable<ProdutoCatalogoGenericResponse> {
    return this.http.post<ProdutoCatalogoGenericResponse>(
      `${this.targetV2}/orcamento-grupo-itens/${idOrcamentoGrupoItem}/produto-catalogo/inclusao`,
      payload
    );
  }

  @Dispatch() clearState = () => new DefinicaoEscopoLojaInsumoActions.clearState();
  @Dispatch() setGrupoItensApi = (idOrcamentoGrupo: number) =>
    new DefinicaoEscopoLojaInsumoActions.setGrupoItensApi(idOrcamentoGrupo);
  @Dispatch() setGrupoItemStatus = (
    id: number,
    property: KeyofGrupoItemDELI,
    status: AwInputStatus,
    propertyId?: GrupoItemDELIID
  ) => new DefinicaoEscopoLojaInsumoActions.setGrupoItemStatus(id, property, status, propertyId);
  @Dispatch() setGrupoItemLoading = (id: number, loading: boolean, idProperty?: GrupoItemDELIID) =>
    new DefinicaoEscopoLojaInsumoActions.setGrupoItemLoading(id, loading, idProperty);
  @Dispatch() setGrupoItemEditing = (idOrcamentoGrupoItem: number, property: KeyofGrupoItemDELI, editing: boolean) =>
    new DefinicaoEscopoLojaInsumoActions.setGrupoItemEditing(idOrcamentoGrupoItem, property, editing);
  @Dispatch() updateGrupoItemComplementoApi = (idOrcamentoGrupoItem: number, complemento: string) =>
    new DefinicaoEscopoLojaInsumoActions.updateGrupoItemComplementoApi(idOrcamentoGrupoItem, complemento);
  @Dispatch() updateGrupoItemTagApi = (idOrcamentoGrupoItem: number, tag: string) =>
    new DefinicaoEscopoLojaInsumoActions.updateGrupoItemTagApi(idOrcamentoGrupoItem, tag);
  @Dispatch() incluirGrupoItemApi = (grupoItem: InclusaoGrupoItem) =>
    new DefinicaoEscopoLojaInsumoActions.incluirGrupoItemApi(grupoItem);
  @Dispatch() excluirGrupoItemApi = (idOrcamentoGrupoItem: number, idGrupoItem: number) =>
    new DefinicaoEscopoLojaInsumoActions.excluirGrupoItemApi(idOrcamentoGrupoItem, idGrupoItem);
  @Dispatch() updateGrupoItem = (id: number, partial: Partial<GrupoItemDELI>, propertyId?: GrupoItemDELIID) =>
    new DefinicaoEscopoLojaInsumoActions.updateGrupoItem(id, partial, propertyId);
  @Dispatch() duplicarGrupoItemApi = (duplicarGrupoItem: DuplicarGrupoItem) =>
    new DefinicaoEscopoLojaInsumoActions.duplicarGrupoItemApi(duplicarGrupoItem);
  @Dispatch() setGrupoItemFilhoProdutosApi = (
    idOrcamentoGrupoItem: number,
    idGrupoItemFilho: number,
    idOrcamentoGrupoItemFilho: number
  ) =>
    new DefinicaoEscopoLojaInsumoActions.setGrupoItemFilhoProdutosApi(
      idOrcamentoGrupoItem,
      idGrupoItemFilho,
      idOrcamentoGrupoItemFilho
    );
  @Dispatch() incluirProdutoGrupoItemFilhoApi = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    payload: ProdutoCatalogoPayload
  ) =>
    new DefinicaoEscopoLojaInsumoActions.incluirProdutoGrupoItemFilhoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      payload
    );
  @Dispatch() updateProdutoGrupoItemFilhoApi = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idOrcamentoGrupoItemProdutoCatalogo: number,
    payload: ProdutoCatalogoPayload
  ) =>
    new DefinicaoEscopoLojaInsumoActions.updateProdutoGrupoItemFilhoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      idOrcamentoGrupoItemProdutoCatalogo,
      payload
    );
  @Dispatch() setProdutoSelecionadoGrupoItemFilho = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idOrcamentoGrupoItemProdutoCatalogo: number,
    selecionado: boolean
  ) =>
    new DefinicaoEscopoLojaInsumoActions.setProdutoSelecionadoGrupoItemFilhoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      idOrcamentoGrupoItemProdutoCatalogo,
      selecionado
    );
  @Dispatch() excluirProdutoGrupoItemFilhoApi = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idProdutoCatalogo: number
  ) =>
    new DefinicaoEscopoLojaInsumoActions.excluirProdutoGrupoItemFilhoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      idProdutoCatalogo
    );
  @Dispatch() updateFiltroCatalogoGrupoItemFilho = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    filtro: FiltroProdutoCatalogo
  ) =>
    new DefinicaoEscopoLojaInsumoActions.updateFiltroCatalogoGrupoItemFilho(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      filtro
    );
  @Dispatch() setGrupoItemQuantitativoApi = (idOrcamentoGrupoItem: number) =>
    new DefinicaoEscopoLojaInsumoActions.setGrupoItemQuantitativoApi(idOrcamentoGrupoItem);
  @Dispatch() updateGrupoItemQuantitativoApi = (
    idOrcamentoGrupoItem: number,
    idFase: number,
    pavimento: Pavimento,
    centroCusto: CentroCusto,
    qtde: number
  ) =>
    new DefinicaoEscopoLojaInsumoActions.updateGrupoItemQuantitativoApi(
      idOrcamentoGrupoItem,
      idFase,
      pavimento,
      centroCusto,
      qtde
    );
  @Dispatch() updateGrupoItemFilho = (
    idOrcamentoGrupoItem: number,
    idFilho: number,
    partialOrOperator: Partial<GrupoItemDELIFilho> | StateOperator<GrupoItemDELIFilho>
  ) => new DefinicaoEscopoLojaInsumoActions.updateGrupoItemFilho(idOrcamentoGrupoItem, idFilho, partialOrOperator);

  @Dispatch() setGrupoItemFilhosApi = (idOrcamentoGrupoItem: number, idGrupoItem: number) =>
    new DefinicaoEscopoLojaInsumoActions.setGrupoItemFilhosApi(idOrcamentoGrupoItem, idGrupoItem);

  @Dispatch() setGrupoItemFilhoStatus = (
    idOrcamentoGrupoItem: number,
    idOrcamentoGrupoItemFilho: number,
    property: KeyofGrupoItemDELIFilho,
    status: AwInputStatus
  ) =>
    new DefinicaoEscopoLojaInsumoActions.setGrupoItemFilhoStatus(
      idOrcamentoGrupoItem,
      idOrcamentoGrupoItemFilho,
      property,
      status
    );

  @Dispatch() setVariacoesProdutoCatalogoApi = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idProdutoCatalogo: number
  ) =>
    new DefinicaoEscopoLojaInsumoActions.setVariacoesProdutoCatalogoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      idProdutoCatalogo
    );

  @Dispatch() setVariacoesProdutoSelecionadoApi = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idOrcamentoGrupoItemProdutoCatalogo: number
  ) =>
    new DefinicaoEscopoLojaInsumoActions.setVariacoesProdutoSelecionadoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      idOrcamentoGrupoItemProdutoCatalogo
    );

  @Dispatch() changeVariacaoProdutoSelecionado = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idProdutoCatalogoOld: number,
    produtoCatalogoNew: ProdutoCatalogoPayload
  ) =>
    new DefinicaoEscopoLojaInsumoActions.changeVariacaoProdutoSelecionado(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      idProdutoCatalogoOld,
      produtoCatalogoNew
    );

  @Dispatch() setLoading = (loading: boolean) => new DefinicaoEscopoLojaInsumoActions.setLoading(loading);
  @Dispatch() toggleAllAtivos = (open = true) => new DefinicaoEscopoLojaInsumoActions.toggleAllAtivos(open);
}
