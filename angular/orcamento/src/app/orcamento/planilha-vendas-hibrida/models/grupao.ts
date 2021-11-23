import { PlanilhaHibridaGrupo } from './grupo';

export interface Grupao {
  idGrupao: number;
  numeroGrupao: number;
  descricaoGrupao: string;
  ativo: boolean;
  idFamilia: number;
  grupos?: PlanilhaHibridaGrupo[];
  hasGrupos?: boolean;
}
