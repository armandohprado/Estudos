import { Grupo } from './grupo';

export interface Grupao {
  idGrupao: number;
  numeroGrupao: number;
  descricaoGrupao: string;
  ativo: boolean;
  idFamilia: number;
  idFamiliaCustomizada: number;
  grupos: Grupo[];
  idOrcamentoFamilia: number;
  idUnico?: string;

  opened?: boolean;
}
