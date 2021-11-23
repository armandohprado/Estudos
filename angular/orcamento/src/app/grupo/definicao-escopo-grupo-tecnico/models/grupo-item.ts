import { GrupoItem, GrupoItemFilho } from '../../definicao-escopo/model/grupo-item';
import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { AwInputStatusProperty } from '@aw-components/aw-input/aw-input.type';
import { Quantitativo } from '../../definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';

export interface GrupoItemTecnico extends GrupoItem {
  loading?: boolean;
  statusProperty?: GrupoItemTecnicoStatusProperty;
  editingProperty?: GrupoItemTecnicoEditProperty;
  errorApi?: ErrorApi;
  opened?: boolean;
  duplicar?: boolean;
  filhos?: GrupoItemTecnicoFilho[];
}

export enum GrupoItemTecnicoFilhoTab {
  quantificar,
  eapCliente,
}

export interface GrupoItemTecnicoFilhoPavimentoAmbiente {
  idProjetoEdificioPavimento: number;
  nomePavimento: string;
  idProjetoAmbiente: number;
  idSpk: number;
  area: number;
  numeroPessoas: number;
}

export interface GrupoItemTecnicoFilho extends GrupoItemFilho {
  savingAmbientes?: boolean;
  ambientesSelecionados?: GrupoItemTecnicoFilhoPavimentoAmbiente[];
  activeTab?: GrupoItemTecnicoFilhoTab;
  quantitativo?: Quantitativo;
  quantitativoLoading?: boolean;
  loading?: boolean;
  opened?: boolean;
  statusProperty?: GrupoItemTecnicoFilhoStatusProperty;
  errorApi?: ErrorApi;
}

export interface GrupoItemTecnicoFilhoGrouped {
  descricao: string;
  ordem: number;
  itens: GrupoItemTecnicoFilho[];
}

export type KeyofGrupoItemTecnico = keyof GrupoItemTecnico;
export type KeyofGrupoItemTecnicoFilho = keyof GrupoItemTecnicoFilho;
export type GrupoItemTecnicoStatusProperty = AwInputStatusProperty<GrupoItemTecnico>;
export type GrupoItemTecnicoFilhoStatusProperty = AwInputStatusProperty<GrupoItemTecnicoFilho>;
export type GrupoItemTecnicoEditProperty = Partial<Record<keyof GrupoItemTecnico, boolean>>;
export type GrupoItemTecnicoID = 'idOrcamentoGrupoItem' | 'idGrupoItem';
