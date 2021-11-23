export interface CnFichaAltTipo {
  idCompraNegociacaoGrupoFichaTipo: number;
  idOrcamentoGrupoFichaTipo: number;
  descricao: string;
  ativo: boolean;
}

export interface CnFichaAlt {
  idCompraNegociacaoGrupo: number;
  idOrcamentoGrupoFicha: number;
  idCompraNegociacaoStatus: number;
  nome: string;
  codigo: string;
  compraNegociacaoStatus: string;
  tipos: CnFichaAltTipo[];
  data: Date;
  dataAprovacao: Date;
  detalhe: string;

  idTipoFicha: number;
  descricaoTipoFicha: string;
  valor: number;

  tiposJoined: string;
}
