// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { GrupoAlt, OrcamentoCenarioPadrao } from '../../models';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { DefinicaoEscopoGrupoTecnicoActions } from './state/actions';
import { DefinicaoEscopoService } from '../definicao-escopo/definicao-escopo.service';
import { Observable } from 'rxjs';
import {
  GrupoItemTecnico,
  GrupoItemTecnicoFilho,
  GrupoItemTecnicoFilhoPavimentoAmbiente,
  GrupoItemTecnicoFilhoTab,
  GrupoItemTecnicoID,
  KeyofGrupoItemTecnico,
  KeyofGrupoItemTecnicoFilho,
} from './models/grupo-item';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { map } from 'rxjs/operators';
import { InclusaoGrupoItem } from '../definicao-escopo/model/inclusao-grupo-item';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Pavimento } from '../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { CentroCusto } from '../definicao-escopo/shared/de-distribuir-quantitativo/model/centro-custo';
import { StateOperator } from '@ngxs/store';
import { DefinicaoEscopoLojaService } from '../definicao-escopo-loja/definicao-escopo-loja.service';
import { ProjetoAmbienteService } from '@aw-services/projeto-ambiente/projeto-ambiente.service';
import { DefinicaoEscopoLojaInsumoService } from '../definicao-escopo-loja-insumo/definicao-escopo-loja-insumo.service';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { upsert } from '@aw-utils/util';
import { orderByCodigoWithoutDefinedNumberOfDots } from '@aw-utils/grupo-item/sort-by-numeracao';

@Injectable({ providedIn: 'root' })
export class DefinicaoEscopoGrupoTecnicoService {
  constructor(
    public definicaoEscopoService: DefinicaoEscopoService,
    public definicaoEscopoLojaService: DefinicaoEscopoLojaService,
    private http: HttpClient,
    public projetoAmbienteService: ProjetoAmbienteService,
    public definicaoEscopoLojaInsumoService: DefinicaoEscopoLojaInsumoService
  ) {}

  targetGrupoTecnico = environment.AwApiUrl + 'orcamento-grupo-item-tecnico';

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

  getGruposItens(idOrcamentoGrupo: number): Observable<GrupoItemTecnico[]> {
    return this.definicaoEscopoLojaInsumoService.getGruposItens<GrupoItemTecnico>(idOrcamentoGrupo);
  }

  getGrupoItemFilhos(
    idOrcamentoGrupoItem: number,
    idGrupoItem: number,
    filhosOld?: GrupoItemTecnicoFilho[]
  ): Observable<GrupoItemTecnicoFilho[]> {
    return this.definicaoEscopoLojaInsumoService
      .getGrupoItemFilhos<GrupoItemTecnicoFilho>(idOrcamentoGrupoItem, idGrupoItem)
      .pipe(
        map(filhos => {
          filhosOld = (filhosOld ?? []).filter(filho =>
            filhos.some(f => f.idOrcamentoGrupoItem === filho.idOrcamentoGrupoItem)
          );
          return orderBy<GrupoItemTecnicoFilho>(
            upsert(filhosOld, filhos, 'idOrcamentoGrupoItem'),
            orderByCodigoWithoutDefinedNumberOfDots('numeracaoGrupoItem')
          ).map(filho => {
            filho = {
              ...filho,
              ambientesSelecionados: [],
              activeTab: GrupoItemTecnicoFilhoTab.quantificar,
            };
            return filho;
          });
        })
      );
  }

  duplicarGrupoItemFilho(idOrcamentoGrupoItem: number): Observable<void> {
    return this.http.post<void>(`${this.targetGrupoTecnico}/${idOrcamentoGrupoItem}/duplicacao`, undefined);
  }

  @Dispatch() clearState = () => new DefinicaoEscopoGrupoTecnicoActions.clearState();
  @Dispatch() setGrupoItensApi = (idOrcamentoGrupo: number) =>
    new DefinicaoEscopoGrupoTecnicoActions.setGrupoItensApi(idOrcamentoGrupo);
  @Dispatch() setGrupoItemStatus = (
    id: number,
    property: KeyofGrupoItemTecnico,
    status: AwInputStatus,
    propertyId?: GrupoItemTecnicoID
  ) => new DefinicaoEscopoGrupoTecnicoActions.setGrupoItemStatus(id, property, status, propertyId);
  @Dispatch() setGrupoItemLoading = (id: number, loading: boolean, idProperty?: GrupoItemTecnicoID) =>
    new DefinicaoEscopoGrupoTecnicoActions.setGrupoItemLoading(id, loading, idProperty);
  @Dispatch() setGrupoItemEditing = (idOrcamentoGrupoItem: number, property: KeyofGrupoItemTecnico, editing: boolean) =>
    new DefinicaoEscopoGrupoTecnicoActions.setGrupoItemEditing(idOrcamentoGrupoItem, property, editing);
  @Dispatch() updateGrupoItemComplementoApi = (idOrcamentoGrupoItem: number, complemento: string) =>
    new DefinicaoEscopoGrupoTecnicoActions.updateGrupoItemComplementoApi(idOrcamentoGrupoItem, complemento);
  @Dispatch() updateGrupoItemTagApi = (idOrcamentoGrupoItem: number, tag: string) =>
    new DefinicaoEscopoGrupoTecnicoActions.updateGrupoItemTagApi(idOrcamentoGrupoItem, tag);
  @Dispatch() incluirGrupoItemApi = (grupoItem: InclusaoGrupoItem) =>
    new DefinicaoEscopoGrupoTecnicoActions.incluirGrupoItemApi(grupoItem);
  @Dispatch() excluirGrupoItemApi = (idOrcamentoGrupoItem: number, idGrupoItem: number) =>
    new DefinicaoEscopoGrupoTecnicoActions.excluirGrupoItemApi(idOrcamentoGrupoItem, idGrupoItem);
  @Dispatch() updateGrupoItem = (id: number, partial: Partial<GrupoItemTecnico>, propertyId?: GrupoItemTecnicoID) =>
    new DefinicaoEscopoGrupoTecnicoActions.updateGrupoItem(id, partial, propertyId);
  @Dispatch() duplicarGrupoItemFilhoApi = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idGrupoItem: number
  ) =>
    new DefinicaoEscopoGrupoTecnicoActions.duplicarGrupoItemFilhoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      idGrupoItem
    );
  @Dispatch() setGrupoItemFilhoQuantitativoApi = (idOrcamentoGrupoItemPai: number, idOrcamentoGrupoItem: number) =>
    new DefinicaoEscopoGrupoTecnicoActions.setGrupoItemFilhoQuantitativoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem
    );
  @Dispatch() updateGrupoItemFilhoQuantitativoApi = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idFase: number,
    pavimento: Pavimento,
    centroCusto: CentroCusto,
    qtde: number
  ) =>
    new DefinicaoEscopoGrupoTecnicoActions.updateGrupoItemFilhoQuantitativoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      idFase,
      pavimento,
      centroCusto,
      qtde
    );
  @Dispatch() updateGrupoItemFilho = (
    idOrcamentoGrupoItem: number,
    idFilho: number,
    partialOrOperator: Partial<GrupoItemTecnicoFilho> | StateOperator<GrupoItemTecnicoFilho>
  ) => new DefinicaoEscopoGrupoTecnicoActions.updateGrupoItemFilho(idOrcamentoGrupoItem, idFilho, partialOrOperator);

  @Dispatch() setGrupoItemFilhosApi = (idOrcamentoGrupoItem: number, idGrupoItem: number) =>
    new DefinicaoEscopoGrupoTecnicoActions.setGrupoItemFilhosApi(idOrcamentoGrupoItem, idGrupoItem);

  @Dispatch() setGrupoItemFilhoStatus = (
    idOrcamentoGrupoItem: number,
    idOrcamentoGrupoItemFilho: number,
    property: KeyofGrupoItemTecnicoFilho,
    status: AwInputStatus
  ) =>
    new DefinicaoEscopoGrupoTecnicoActions.setGrupoItemFilhoStatus(
      idOrcamentoGrupoItem,
      idOrcamentoGrupoItemFilho,
      property,
      status
    );

  @Dispatch() setLoading = (loading: boolean) => new DefinicaoEscopoGrupoTecnicoActions.setLoading(loading);

  @Dispatch() setGrupoItemFilhoAmbientesQuantitativoApi = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number
  ) =>
    new DefinicaoEscopoGrupoTecnicoActions.setGrupoItemFilhoAmbientesQuantitativoApi(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem
    );

  @Dispatch() excluirGrupoItemFilhoApi = (idOrcamentoGrupoItemPai: number, idOrcamentoGrupoItem: number) =>
    new DefinicaoEscopoGrupoTecnicoActions.excluirGrupoItemFilhoApi(idOrcamentoGrupoItemPai, idOrcamentoGrupoItem);

  @Dispatch() toggleAmbiente = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    pavimentoAmbiente: GrupoItemTecnicoFilhoPavimentoAmbiente,
    selecionado?: boolean
  ) =>
    new DefinicaoEscopoGrupoTecnicoActions.toggleAmbiente(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      pavimentoAmbiente,
      selecionado
    );

  @Dispatch() updateAmbiente = (
    idOrcamentoGrupoItemPai: number,
    idOrcamentoGrupoItem: number,
    idProjetoAmbiente: number,
    idProjetoEdificioPavimento: number,
    partial: Partial<GrupoItemTecnicoFilhoPavimentoAmbiente>
  ) =>
    new DefinicaoEscopoGrupoTecnicoActions.updateAmbiente(
      idOrcamentoGrupoItemPai,
      idOrcamentoGrupoItem,
      idProjetoAmbiente,
      idProjetoEdificioPavimento,
      partial
    );

  @Dispatch() toggleAllAtivos = (open = true) => new DefinicaoEscopoGrupoTecnicoActions.toggleAllAtivos(open);
}
