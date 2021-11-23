import { Pavimento } from './pavimento';

export interface Edificio {
  idEdificio: number;
  nomeEdificio?: string;
  nomePavimento?: string;
  registroAtivo: boolean;
  dataCriacao: Date;
  dataAlteracao: Date;
  idProjeto: number;
  nomeUsuario: string;
  nomeFantasiaEdificio: string;
  idCondominio: number;
  pavimentos: Pavimento[];
  idOrcamento: number;
  idOrcamentoProjetoEdificio: number;
  canRemove: boolean;
  isDisabled?: boolean;
}

export interface EdificioPayload extends Edificio {
  remove?: boolean;
}
