import { IdDescricao } from '@aw-models/id-descricao';

export interface PlanilhaClienteItem {
  id: number;
  codigo: string;
  descricao: string;
  itemBloqueado: boolean;
  itemUtilizado: boolean;
  orcamentoGrupoItem: IdDescricao[];
  nivel: number;
  selecionado: boolean;
  unidadeMedida: number;

  idPlanilhaClienteItemOrcamentoGrupoItem?: number;
}

export interface PlanilhaClienteFiltro {
  id: number;
  descricao: string;
  selecionado: boolean;
}

export interface PlanilhaClienteOrcamentoGrupoItemPayload {
  idPlanilhaClienteItem: number;
  idOrcamentoGrupoItem: number;
}

export interface PlanilhaClienteOrcamentoGrupoItemResponse {
  id: number;
  idOrcamentoGrupoItem: number;
  idPlanilhaClienteItemOrcamentoGrupoItem: number;
}
