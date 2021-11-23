import { Pavimento } from './pavimento';

export interface Fase {
  idFase: number;
  nomeFase: string;
  quantidadeTotal: number;
  edificios: Pavimento[];
  sites: Pavimento[];
  andares?: Pavimento[];
  idOrcamento?: number;
}
