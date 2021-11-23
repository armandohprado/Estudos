import { ColDef } from '@aw-utils/excel/excel';
import { SpreadjsHelper } from '@aw-utils/excel/spreadjs-helper';

export interface CheckListNivelItem {
  _id: number;
  _idCheckListAgrupador: number;
  _idCheckList: number;
  _idCheckListNivel: number;
  _row: number;
  idCheckListIntegradoNivelItem: number | null;
  idProjetoCheckListIntegradoNivelItem: number;
  idProjetoCheckListIntegrado: number;
  idCheckListIntegradoNivel: number;
  descricao: string;
  acao?: string;
  dataPrevista?: Date;
  responsavel?: string;
  observacoes?: string;
  idCheckListStatus: number;
  status: string;
  url?: string;
  percentualPrevisto?: number;
  percentualRealizado?: number;
  valor?: number;
  visivel: boolean;

  bloquearAcao: boolean;
  bloquearDataPrevista: boolean;
  bloquearResponsavel: boolean;
  bloquearObservacoes: boolean;
  bloquearStatus: boolean;
  bloquearPercentualPrevisto: boolean;
  bloquearPercentualRealizado: boolean;
  bloquearValor: boolean;
  publicavelComunicado: boolean;
  publicavelDescricao: string;
  funcao: number;
  tipoHorario: boolean;

  columnType: CheckListColumnType;
  colDefKey: ColDefKeys;
  helperKey: HelperKeys;

  _button?: undefined;
}

export interface CheckListNivel {
  _id: number;
  _idCheckListAgrupador: number;
  _idCheckList: number;
  _row: number;
  idCheckListIntegradoNivel: number;
  idProjetoCheckListIntegrado: number;
  descricao: string;
  permitidoInserir: boolean;
  bloquearAcao: boolean;
  bloquearDataPrevista: boolean;
  bloquearResponsavel: boolean;
  bloquearObservacoes: boolean;
  bloquearStatus: boolean;
  bloquearPercentualPrevisto: boolean;
  bloquearPercentualRealizado: boolean;
  bloquearValor: boolean;
  publicavelComunicado: boolean;
  publicavelDescricao: string;
  tipoHorario: boolean;
  itens: CheckListNivelItem[];

  funcao: number;
  columnType: CheckListColumnType;
  colDefKey: ColDefKeys;
  helperKey: HelperKeys;
  collapsed: boolean;
  maxItens?: number;
}

export interface CheckList {
  _id: number;
  _idCheckListAgrupador: number;
  _row: number;
  sequencia: number;
  descricao: string;
  funcao: number;
  idCheckListIntegradoCategoria: number;
  checkListIntegradoCategoria: string;
  niveis: CheckListNivel[];

  columnType: CheckListColumnType;
  colDefKey: ColDefKeys;
  helperKey: HelperKeys;
  collapsed: boolean;
}

export enum CheckListColumnType {
  Itens = 'itens',
  Meta = 'meta',
  ChangeOrder = 'changeOrder',
}

export type ColDefKeys = `${CheckListColumnType}ColDef`;
export type HelperKeys = `${CheckListColumnType}Helper`;

export type CheckListWithColumnType = { [K in ColDefKeys]: ColDef<CheckListNivelItem>[] } &
  { [K in HelperKeys]: SpreadjsHelper<CheckListNivelItem> };

export interface CheckListAgrupador {
  _id: number;
  _row: number;
  descricao: string;
  ordem: number;
  checklists: CheckList[];

  columnType: CheckListColumnType;
  colDefKey: ColDefKeys;
  helperKey: HelperKeys;
  collapsed: boolean;
}

export interface CheckLists {
  idProjeto: number;
  numeroProjeto: string;
  nomeProjeto: string;
  dataSemana: Date;
  publicado: boolean;
  publicadoGi: boolean;
  dataPublicacao?: Date;
  informacaoEmail: string | null;
  agrupadorChecklist: CheckListAgrupador[];
}

export interface CheckListNivelItemAtualizarPayload {
  idProjetoCheckListIntegradoNivelItem: number;
  acao?: string;
  dataPrevista?: Date;
  responsavel?: string;
  observacoes?: string;
  idCheckListStatus: number;
  descricao: string;
  percentualPrevisto?: number;
  percentualRealizado?: number;
  valor?: number;
  visivel: boolean;
}

export interface CheckListNivelItemAddPayload {
  idProjeto: number;
  idCheckListIntegradoNivel: number;
  descricao: string;
  idProjetoCheckListIntegrado: number;
}
