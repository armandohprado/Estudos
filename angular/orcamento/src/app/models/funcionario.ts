import { Cargo } from './cargo';

export interface Funcionario {
  idFuncionario: number;
  nome: string;
  nomeFantasia: string;
  loginRede: string;
  email: string;
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
  celularCorporativo: string;
  celularParticular: string;
  telefoneCorporativo: string;
  telefoneParticular: string;
  idOrcamentoGrupoResponsavel: number;
  selecionado: boolean;
  nomeCargo: string;
}

export interface FuncionarioIncluirPayload {
  idFuncionario: number;
  idTipoResponsavel: number;
  principal: boolean;
  idOrcamentoGrupo: number;
  idGrupo: number;
}
