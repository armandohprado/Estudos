export interface ControleFichaTipo {
  idCompraNegociacaoGrupoFichaTipo: number;
  descricao: string;
  ativo: boolean;
}

export interface ControleFichaAprovador {
  idCompraNegociacaoGrupoFichaAprovador: number;
  idAprovador: number;
  tipo: string;
  cargo: string;
  nome: string;
  aprovadorNecessario: boolean;
}

export interface ControleFicha {
  idCompraNegociacaoGrupoFicha: number;
  idCompraNegociacaoGrupo: number;
  idGrupo: number;
  codigo: string;
  nome: string;
  idOrcamentoCenario: number;
  idOrcamento: number;
  nomeOrcamentoCenario: string;
  idOrcamentoCenarioOrigem?: number;
  congelado: boolean;
  idOrcamentoChangeOrder?: number;
  contratoPrincipal: boolean;
  data: Date;
  dataAprovacao: Date;
  idCompraNegociacaoStatus: number;
  compraNegociacaoStatus: string;
  idFornecedor?: number;
  nomeFantasia?: string;
  detalhe: string;
  tipos: ControleFichaTipo[];
  aprovadores: ControleFichaAprovador[];
  idOrcamentoGrupoFicha: number;
  idOrcamentoGrupo: number;
  idTipoFicha?: number;
  descricao?: string;
}

export interface ControleFichaContrato {
  idOrcamentoCenario: number;
  idOrcamento: number;
  nomeOrcamentoCenario: string;
  idOrcamentoCenarioOrigem?: number;
  congelado: boolean;
  idOrcamentoChangeOrder?: number;
  contratoPrincipal: boolean;
}

export interface ControleFichaGrupo {
  idCompraNegociacaoGrupo: number;
  idGrupo: number;
  codigo: string;
  nome: string;
  idOrcamentoCenario: number;
  idOrcamento: number;
  nomeOrcamentoCenario: string;
  idOrcamentoCenarioOrigem?: number;
  congelado: boolean;
  idOrcamentoChangeOrder?: number;
  contratoPrincipal: boolean;
}
