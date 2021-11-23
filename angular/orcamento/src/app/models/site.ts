import { Edificio } from './edificio';

export interface Site {
  idCondominio: number;
  nomeCondominio: string;
  nomeFantasiaCondominio: string;
  edificios: Edificio[];
}
