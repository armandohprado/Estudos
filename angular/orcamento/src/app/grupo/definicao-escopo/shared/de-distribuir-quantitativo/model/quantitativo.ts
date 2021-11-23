import { Fase } from './fase';

export interface Quantitativo {
  fases: Fase[];
  descricao: null;
  numeracao: null;
  unidadeMedida: string;
  tag: string;
  quantidade?: number;
  idOrcamentoGrupoItem?: number;
  idPropostaItem?: number;
  valorTotal?: number;
  liberarQuantitativo: boolean;
  loading?: boolean;
}
