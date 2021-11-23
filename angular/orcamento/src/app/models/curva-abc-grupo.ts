import { Grupo } from './grupo';

export interface CurvaAbcGrupo extends Grupo {
  multiplos?: CurvaAbcGrupo[];
  valorConsiderado: number;
  diff: number;
  regraFornecedor: string;
  total: number;
  codigoGrupoInt: number;
}
