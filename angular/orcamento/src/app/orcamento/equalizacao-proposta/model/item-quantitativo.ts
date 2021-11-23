import { EpFornecedorBase } from './fornecedor';

export enum EpPropostaItemQuantitativoNivel {
  fase,
  pavimento,
  centroCusto,
}

export interface EpPropostaItemQuantitativoItem extends EpOrcamentoGrupoItemQuantitativoFornecedor {
  nomeCentroCusto: string;
  idProjetoCentroCusto: number;
  nomePavimento: string;
  idProjetoEdificioPavimento: number;
  nomeFase: string;
  idFase: number;
  labelOnly: boolean;
  id: string;
  idFasePavimentoCentro: string;
  nivel: EpPropostaItemQuantitativoNivel;
  label: string;
  idPropostaItem: number;
  loading?: boolean;
  disabled?: boolean;
}

export interface EpOrcamentoGrupoItemQuantitativoFornecedor extends EpFornecedorBase {
  quantidade: number;
}

export interface EpOrcamentoGrupoItemQuantitativoCentroCusto {
  idProjetoCentroCusto: number;
  nomeCentroCusto: string;
  fornecedores: EpOrcamentoGrupoItemQuantitativoFornecedor[];
}

export interface EpOrcamentoGrupoItemQuantitativoPavimento {
  idProjetoEdificioPavimento: number;
  nomePavimento: string;
  centrosCustos: EpOrcamentoGrupoItemQuantitativoCentroCusto[];
}

export interface EpOrcamentoGrupoItemQuantitativoFase {
  idFase: number;
  nomeFase: string;
  pavimentos: EpOrcamentoGrupoItemQuantitativoPavimento[];
}

export interface EpPropostaItemQuantitativoAtualizarPayload {
  idOrcamentoGrupoItem: number;
  idFase: number;
  idProjetoCentroCusto: number;
  idProjetoEdificioPavimento: number;
  quantidade: number;
}
