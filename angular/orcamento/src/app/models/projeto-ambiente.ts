import { UIState } from './ui-state';

export interface ProjetoAmbiente extends UIState {
  idProjetoAmbiente: number;
  nomeAmbiente: string;
  metragem: number;
  peDireito: number;
  idProjetoEdificioPavimento: number;
  idTipoForro: number;
  forro: string;
  idSpk?: number;

  selecionado?: boolean;
}

export interface ProjetoAmbienteSelecionarPayload {
  idProjetoAmbiente: number[];
  idSpk: string[];
  idOrcamentoGrupoItem: number;
  numeroPessoas: number;
  areaAndar: number;
  idProjetoEdificioPavimento: number;
}
