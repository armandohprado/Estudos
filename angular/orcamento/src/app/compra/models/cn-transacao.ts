export interface CnTransacao {
  idCompraNegociacaoGrupoTransacao: number;
  idCompraNegociacaoGrupo: number;
  idCompraNegociacaoGrupoFicha: number;
  idCompraNegociacaoGrupoMapa: number;
  idCompraNegociacaoStatus: number;
  compraNegociacaoStatus: string;
  data: Date;
  valor: number;
  posicao: number;
  idGrupo: number;
  codigo: string;
  nome: string;
}
