import { Cargo } from './cargo';

export interface Arquitetura {
  idFuncionario: number;
  nomeFuncionario: string;
  nomeFantasiaFuncionario: string;
  loginRede: string;
  emailFuncionario: string;
  urlFoto: string;
  foto: string;
  cargo: Cargo;
  idAgrupadorCargo: number;
  idCargo: number;
  idEquipe: number;
  ativo: boolean;
  dataCadastro: Date;
  principal: boolean;
  nomeTipoResponsavel: string;
  flagResponsavel: number;
}
