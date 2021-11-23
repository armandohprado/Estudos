import { Edificio } from './edificio-dp';
import { Site } from './site-dp';
import { Andar } from './andar-dp';

export interface Fase {
  idFase?: number;
  nomeFase?: string;
  quantidadeTotal?: number;
  edificios?: Edificio[];
  sites?: Site[];
  andares?: Andar[];
}

export interface Quantitativo {
  fases?: Fase[];
  idPropostaItem?: number;
  descricao?: string;
  numeracao?: string;
  orcado?: boolean;
  quantidade?: number;
  unidadeMedida?: string;
  valorTotal?: number;
  tag?: any;
}
