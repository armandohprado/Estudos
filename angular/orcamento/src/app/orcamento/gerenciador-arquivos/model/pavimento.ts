import { ProjetoAlt } from '../../../models';

export interface GaSite {
  id: number;
  nome: string;
  edificios: GaEdificio[];
  type: PavimentoType;
}

export interface GaEdificio {
  id: number;
  nome: string;
  pavimentos: GaAndar[];
  idSite: number;
  type: PavimentoType;
}

export interface GaAndar {
  id: number;
  nome: string;
  ordem: number;
  idSite: number;
  idEdificio: number;
  type: PavimentoType;
}

export enum PavimentoType {
  site = 'site',
  edificio = 'edificio',
  andar = 'andar',
}
export type Pavimento = GaSite | GaEdificio | GaAndar;
export type PavimentoTupple = [ProjetoAlt, GaSite, GaEdificio | undefined, GaAndar | undefined];
