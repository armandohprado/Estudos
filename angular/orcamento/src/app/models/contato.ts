import { Cargo } from './cargo';

export interface Contato {
  idContato: number;
  idTipoContato: number;
  idFornecedor: number;
  nome: string;
  email: string;
  principal: boolean;
  celularPrincipal: string;
  celularSecundario: string;
  telefonePrincipal: string;
  telefoneSecundario: string;
  cargo: Cargo;
  ativo: boolean;
  contatoInfo?: string;
}

export interface ContatoAlt {
  idContato: number;
  idFornecedor: number;
  principal: boolean;
  nome: string;
  email: string;
  celularPrincipal: string;
  celularSecundario: string;
  telefonePrincipal: string;
  telefoneSecundario: string;
  idAreaContato: number;
  idCargoContato: number;
  login: string;
  senha: string;
  tokenRedefinirSenha: string;
  tokenRedefinirSenhaExpiracao: string;
  ativo: boolean;
  acessoFornecedor: boolean;
  acessoProjetista: boolean;
  recebeResumoCotacao: boolean;
  acessoTemporario: boolean;
  dataCriacao: string;
  dataAlteracao: string;
  idContatoLegado: number;
}
