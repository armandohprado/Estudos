import { GaArquivoGrupo } from './atividade';

export interface GaGrupao {
  nome: string;
  grupos: GaArquivoGrupo[];

  opened?: boolean;
}

export interface GaFamilia {
  nome: string;
  grupoes: GaGrupao[];

  opened?: boolean;
}
