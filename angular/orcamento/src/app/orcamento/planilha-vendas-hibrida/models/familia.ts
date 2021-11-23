import { Grupao } from './grupao';

export interface Familia {
  idFamilia: number;
  numeroFamilia: number;
  descricaoFamilia: string;
  ordemFamilia: number;
  valorTotalFamilia: number;
  grupao: Grupao[];
}
