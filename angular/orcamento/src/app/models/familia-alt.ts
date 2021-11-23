import { GrupoAlt } from '@aw-models/grupo-alt';

export interface FamiliaAlt {
  idOrcamentoFamilia: number;
  descricaoFamilia: string;
  idFamilia?: number;
  idFamiliaCustomizada?: number;
  grupos: GrupoAlt[];

  // Custom
  customizada?: boolean;
  opcional?: boolean;
  totalSelecionado?: number;
}

export interface FamiliaAltTotal {
  idOrcamentoFamilia: number;
  descricaoFamilia: string;
  total: number;
  opcional: boolean;
}
