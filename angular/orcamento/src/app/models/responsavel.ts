import { Cargo } from './cargo';

export interface Responsavel {
  idOrcamentoGrupoResponsavel?: number;
  principal?: boolean;
  flagResponsavel?: number;
  idFuncionario: number;
  nome: string;
  nomeFantasia: string;
  idTipoResponsavel?: string;
  loginRede: string;
  email: string;
  urlFoto: string;
  foto: string;
  nomeTipoResponsavel: string;
  idAgrupadorCargo: number;
  cargo: Cargo;
  idEquipe: number;
  ativo: boolean;
  dataCadastro: Date;
}

export interface ResponsavelAlt {
  email: string;
  idFuncionario: number;
  nome: string;
  nomeFantasia: string;
  selecionado: boolean;
}
