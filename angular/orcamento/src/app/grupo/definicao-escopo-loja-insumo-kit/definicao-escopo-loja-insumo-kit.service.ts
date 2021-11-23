import { Injectable } from '@angular/core';
import { GrupoAlt, OrcamentoCenarioPadrao } from '../../models';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { DefinicaoEscopoLojaInsumoKitActions } from './state/actions';
import { FormBuilder } from '@angular/forms';
import { DefinicaoEscopoService } from '../definicao-escopo/definicao-escopo.service';
import { forkJoin, Observable } from 'rxjs';
import {
  GrupoItemKit,
  GrupoItemKitFilho,
  GrupoItemKitID,
  KeyofGrupoItemKit,
  KeyofGrupoItemKitFilho,
} from './models/grupo-item';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { map } from 'rxjs/operators';
import { InclusaoGrupoItem } from '../definicao-escopo/model/inclusao-grupo-item';
import { DuplicarGrupoItem } from '../definicao-escopo/model/duplicar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GenericResponse } from '../definicao-escopo/model/generic-response';
import { Pavimento } from '../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { CentroCusto } from '../definicao-escopo/shared/de-distribuir-quantitativo/model/centro-custo';
import { StateOperator } from '@ngxs/store';
import { DefinicaoEscopoLojaService } from '../definicao-escopo-loja/definicao-escopo-loja.service';
import { FiltroProdutoCatalogo } from '../definicao-escopo-loja-insumo/models/produto-catalogo';
import { Kit, KitPayload } from './models/kit';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { orderByCodigoWithoutDefinedNumberOfDots } from '@aw-utils/grupo-item/sort-by-numeracao';
import { DefinicaoEscopoLojaInsumoService } from '../definicao-escopo-loja-insumo/definicao-escopo-loja-insumo.service';
import { GrupoItemDELITab } from '../definicao-escopo-loja-insumo/models/grupo-item';

@Injectable({ providedIn: 'root' })
export class DefinicaoEscopoLojaInsumoKitService {
  constructor(
    private formBuilder: FormBuilder,
    public definicaoEscopoService: DefinicaoEscopoService,
    public definicaoEscopoLojaService: DefinicaoEscopoLojaService,
    public definicaoEscopoLojaInsumoService: DefinicaoEscopoLojaInsumoService,
    private http: HttpClient
  ) {}

  target = environment.AwApiUrl + 'definicao-escopo-loja';
  targetOrcamentoGrupo = environment.AwApiUrl + 'v2/grupos/orcamento-grupo';
  targetKit = this.target + '/kit';

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
    this.clearState();
  }

  getGruposItens(idOrcamentoGrupo: number): Observable<GrupoItemKit[]> {
    return this.http.get<GrupoItemKit[]>(`${this.targetOrcamentoGrupo}/${idOrcamentoGrupo}/kit/grupo-itens`).pipe(
      map(grupoItens =>
        grupoItens.map(grupoItem => {
          grupoItem.tag = grupoItem.tag ?? null;
          grupoItem.statusProperty = {};
          grupoItem.editingProperty = {};
          grupoItem.valorUnitarioProdutoReferencia = grupoItem.valorUnitarioProdutoReferencia ?? 0;
          grupoItem.quantidadeTotal = grupoItem.quantidadeTotal ?? 0;
          grupoItem.filtros = [];
          grupoItem.activeTabQuantificar = GrupoItemDELITab.quantificar;
          return grupoItem;
        })
      )
    );
  }

  getGrupoItemFilhos(idOrcamentoGrupoItem: number, idGrupoItem: number): Observable<GrupoItemKitFilho[]> {
    return this.http
      .get<GrupoItemKitFilho[]>(`${this.targetOrcamentoGrupo}/${idOrcamentoGrupoItem}/grupo-itens/${idGrupoItem}/kit`)
      .pipe(
        map(filhos =>
          filhos.map(filho => ({
            ...filho,
            statusProperty: {},
            // Se precisar dessa numeracao, vai ter que mudar o orderByNumeracaoFilho ;)
            numeracao: null,
            numeracaoGrupoItem: filho.numeracaoGrupoItem ?? filho.numeracao,
          }))
        ),
        map(filhos => orderBy(filhos, orderByCodigoWithoutDefinedNumberOfDots<GrupoItemKitFilho>('numeracaoGrupoItem')))
      );
  }

  getProdutosAssociados(idOrcamentoGrupoItem: number): Observable<Kit[]> {
    return this.http.get<Kit[]>(`${this.targetKit}/orcamento-grupo-item/${idOrcamentoGrupoItem}/selecionados`).pipe(
      map(produtos => produtos ?? []),
      map(kits =>
        kits.map(kit => {
          delete kit.filtros;
          return kit;
        })
      )
    );
  }

  getProdutos(idGrupoItem: number): Observable<Kit[]> {
    return this.http.get<Kit[]>(`${this.targetKit}/grupo-item/${idGrupoItem}`).pipe(map(produtos => produtos ?? []));
  }

  getAllProdutos(idGrupoItem: number, idOrcamentoGrupoItem: number): Observable<[Kit[], Kit[]]> {
    return forkJoin([this.getProdutos(idGrupoItem), this.getProdutosAssociados(idOrcamentoGrupoItem)]).pipe(
      map(arr => {
        arr[0] = arr[0].map(cat => {
          const kitSelecionado = arr[1].find(kit => kit.idKit === cat.idKit);
          return {
            ...cat,
            ...kitSelecionado,
            selecionadoCatalogo: !!kitSelecionado,
          };
        });
        return arr;
      })
    );
  }

  selecionarKit(idOrcamentoGrupoItem: number, payload: KitPayload): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.targetKit}/orcamento-grupo-item/selecionar`, payload);
  }

  incluirKit(payload: KitPayload): Observable<KitPayload> {
    return this.http.post<KitPayload>(`${this.targetKit}/orcamento-grupo-item`, payload);
  }

  deleteProduto(idOrcamentoGrupoItem: number, idOrcamentoGrupoItemKit: number): Observable<void> {
    return this.http.delete<void>(
      `${this.targetKit}/${idOrcamentoGrupoItemKit}/orcamento-grupo-item/${idOrcamentoGrupoItem}`
    );
  }

  @Dispatch() clearState = () => new DefinicaoEscopoLojaInsumoKitActions.clearState();
  @Dispatch() setGrupoItensApi = (idOrcamentoGrupo: number) =>
    new DefinicaoEscopoLojaInsumoKitActions.setGrupoItensApi(idOrcamentoGrupo);
  @Dispatch() setGrupoItemStatus = (
    id: number,
    property: KeyofGrupoItemKit,
    status: AwInputStatus,
    propertyId?: GrupoItemKitID
  ) => new DefinicaoEscopoLojaInsumoKitActions.setGrupoItemStatus(id, property, status, propertyId);
  @Dispatch() setGrupoItemLoading = (id: number, loading: boolean, idProperty?: GrupoItemKitID) =>
    new DefinicaoEscopoLojaInsumoKitActions.setGrupoItemLoading(id, loading, idProperty);
  @Dispatch() setGrupoItemEditing = (idOrcamentoGrupoItem: number, property: KeyofGrupoItemKit, editing: boolean) =>
    new DefinicaoEscopoLojaInsumoKitActions.setGrupoItemEditing(idOrcamentoGrupoItem, property, editing);
  @Dispatch() updateGrupoItemComplementoApi = (idOrcamentoGrupoItem: number, complemento: string) =>
    new DefinicaoEscopoLojaInsumoKitActions.updateGrupoItemComplementoApi(idOrcamentoGrupoItem, complemento);
  @Dispatch() updateGrupoItemTagApi = (idOrcamentoGrupoItem: number, tag: string) =>
    new DefinicaoEscopoLojaInsumoKitActions.updateGrupoItemTagApi(idOrcamentoGrupoItem, tag);
  @Dispatch() incluirGrupoItemApi = (grupoItem: InclusaoGrupoItem) =>
    new DefinicaoEscopoLojaInsumoKitActions.incluirGrupoItemApi(grupoItem);
  @Dispatch() excluirGrupoItemApi = (idOrcamentoGrupoItem: number, idGrupoItem: number) =>
    new DefinicaoEscopoLojaInsumoKitActions.excluirGrupoItemApi(idOrcamentoGrupoItem, idGrupoItem);
  @Dispatch() updateGrupoItem = (id: number, partial: Partial<GrupoItemKit>, propertyId?: GrupoItemKitID) =>
    new DefinicaoEscopoLojaInsumoKitActions.updateGrupoItem(id, partial, propertyId);
  @Dispatch() duplicarGrupoItemApi = (duplicarGrupoItem: DuplicarGrupoItem) =>
    new DefinicaoEscopoLojaInsumoKitActions.duplicarGrupoItemApi(duplicarGrupoItem);
  @Dispatch() setGrupoItemFilhoProdutosApi = (idOrcamentoGrupoItem: number, idGrupoItem: number) =>
    new DefinicaoEscopoLojaInsumoKitActions.setGrupoItemProdutosApi(idOrcamentoGrupoItem, idGrupoItem);
  @Dispatch() incluirProdutoGrupoItemApi = (idOrcamentoGrupoItem: number, payload: KitPayload) =>
    new DefinicaoEscopoLojaInsumoKitActions.incluirProdutoGrupoItemApi(idOrcamentoGrupoItem, payload);
  @Dispatch() updateProdutoGrupoItemApi = (
    idOrcamentoGrupoItem: number,
    idOrcamentoGrupoItemKit: number,
    payload: KitPayload
  ) =>
    new DefinicaoEscopoLojaInsumoKitActions.updateProdutoGrupoItemApi(
      idOrcamentoGrupoItem,
      idOrcamentoGrupoItemKit,
      payload
    );
  @Dispatch() setProdutoSelecionadoGrupoItem = (
    idOrcamentoGrupoItem: number,
    idOrcamentoGrupoItemKit: number,
    selecionado: boolean
  ) =>
    new DefinicaoEscopoLojaInsumoKitActions.setProdutoSelecionadoGrupoItemApi(
      idOrcamentoGrupoItem,
      idOrcamentoGrupoItemKit,
      selecionado
    );
  @Dispatch() excluirProdutoGrupoItemApi = (idOrcamentoGrupoItem: number, idKit: number) =>
    new DefinicaoEscopoLojaInsumoKitActions.excluirProdutoGrupoItemApi(idOrcamentoGrupoItem, idKit);
  @Dispatch() updateFiltroCatalogoGrupoItem = (idOrcamentoGrupoItem: number, filtro: FiltroProdutoCatalogo) =>
    new DefinicaoEscopoLojaInsumoKitActions.updateFiltroCatalogoGrupoItem(idOrcamentoGrupoItem, filtro);
  @Dispatch() setGrupoItemQuantitativoApi = (idOrcamentoGrupoItem: number) =>
    new DefinicaoEscopoLojaInsumoKitActions.setGrupoItemQuantitativoApi(idOrcamentoGrupoItem);
  @Dispatch() updateGrupoItemQuantitativoApi = (
    idOrcamentoGrupoItem: number,
    idFase: number,
    pavimento: Pavimento,
    centroCusto: CentroCusto,
    qtde: number
  ) =>
    new DefinicaoEscopoLojaInsumoKitActions.updateGrupoItemQuantitativoApi(
      idOrcamentoGrupoItem,
      idFase,
      pavimento,
      centroCusto,
      qtde
    );
  @Dispatch() updateGrupoItemFilho = (
    idOrcamentoGrupoItem: number,
    idFilho: number,
    partialOrOperator: Partial<GrupoItemKitFilho> | StateOperator<GrupoItemKitFilho>
  ) => new DefinicaoEscopoLojaInsumoKitActions.updateGrupoItemFilho(idOrcamentoGrupoItem, idFilho, partialOrOperator);

  @Dispatch() setGrupoItemFilhosApi = (idOrcamentoGrupoItem: number, idGrupoItem: number) =>
    new DefinicaoEscopoLojaInsumoKitActions.setGrupoItemFilhosApi(idOrcamentoGrupoItem, idGrupoItem);

  @Dispatch() setGrupoItemFilhoStatus = (
    idOrcamentoGrupoItem: number,
    idOrcamentoGrupoItemFilho: number,
    property: KeyofGrupoItemKitFilho,
    status: AwInputStatus
  ) =>
    new DefinicaoEscopoLojaInsumoKitActions.setGrupoItemFilhoStatus(
      idOrcamentoGrupoItem,
      idOrcamentoGrupoItemFilho,
      property,
      status
    );

  @Dispatch() toggleCollapseGrupoItem = (idOrcamentoGrupoItem: number, idGrupoItem: number) =>
    new DefinicaoEscopoLojaInsumoKitActions.toggleCollapseGrupoItem(idOrcamentoGrupoItem, idGrupoItem);

  @Dispatch() setLoading = (loading: boolean) => new DefinicaoEscopoLojaInsumoKitActions.setLoading(loading);
  @Dispatch() toggleAllAtivos = (open = true) => new DefinicaoEscopoLojaInsumoKitActions.toggleAllAtivos(open);
}
