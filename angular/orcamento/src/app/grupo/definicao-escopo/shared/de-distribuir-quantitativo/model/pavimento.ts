import { CentroCusto } from './centro-custo';

export interface Pavimento {
  idProjetoEdificioPavimento: number;
  idEdificioPavimento: number;
  idEdificio: number;
  idCondominio: number;
  idFase: number;
  idPavimento?: number;
  nomePavimento: string;
  nomeFantasia: string;
  tipo: Tipo;
  quantidadeTotal: number;
  centrosDeCusto: CentroCusto[];
  andares?: Pavimento[];
  siglaPavimento?: string;
  ordem?: number;
  idOrcamentoGrupoItem?: number;
  quantidadeTotalSite?: number;
  quantidadeTotalAndares?: number;
  idPropostaItem?: number;

  site?: Pavimento;
  permitido?: boolean;
}

export type Tipo = 'Andar' | 'Prédio' | 'Site';
