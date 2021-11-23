import { CenarioSimples } from './cenario';

export interface GrupoGerenciarViewModel {
  numeroGrupao: number;
  nomeGrupao: string;
  idGrupao: number;
  idGrupo: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenarioGrupo: number;
  ativo: boolean;
  codigoGrupo: string;
  nomeGrupo: string;
  complementoOrcamentoGrupo: string;
  idTipoGrupo: number;
}

export interface GrupoGerenciar {
  idGrupao: number;
  idGrupo: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenarioGrupo: number;
  ativo: boolean;
  codigoGrupo: string;
  nomeGrupo: string;
  complementoOrcamentoGrupo: string;
  idTipoGrupo: number;

  cenarios?: CenarioSimples[];
  loadingCenarios?: boolean;

  enabled?: boolean;
  loading?: boolean;
  principal?: boolean;
  isLast?: boolean;
  idOrcamentoGrupoOrigin?: number;
}

export interface GrupaoGerenciar {
  idGrupao: number;
  numeroGrupao: number;
  nomeGrupao: string;
  grupos: GrupoGerenciar[];

  opened?: boolean;
}

export const mapGrupoGerenciar = ({ nomeGrupao, numeroGrupao, ...grupo }: GrupoGerenciarViewModel): GrupoGerenciar => ({
  ...grupo,
  enabled: true,
  cenarios: [],
});
