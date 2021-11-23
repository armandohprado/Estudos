import { GaFamilia } from './familia';

export interface GaAtividade {
  idProjeto: number;
  idAtividade: number;
  nomeAtividade: string;
  idEtapa: number;
  idCondominio: number;
  idEdificio: number;
  idPavimento: number;
  qtdeSuperar: number;

  arquivos?: GaArquivo[];
  id: string;
  opened?: boolean;
  loading?: boolean;
}

export interface GaArquivo {
  id: number;
  checked: boolean;
  nome: string;
  versoes: GaArquivoVersao[];
  grupos: GaArquivoGrupo[];
  idEtapa: number;
  idAtividade: number;
  idCondominio?: number;
  idEdificio?: number;
  idPavimento?: number;

  opened?: boolean;
  openedLoading?: boolean;
  loading?: boolean;
  idAtividadeStore?: string;
  superar?: boolean;
  comentario?: string;
  backup?: GaArquivo;
  familias?: GaFamilia[];
}

export interface GaArquivoVersao {
  versao: string;
  status: string;
  superar: boolean;
  info?: GaArquivoVersaoInfo;
  loading?: boolean;
}

export interface GaArquivoVersaoInfo {
  autor: string;
  comentario: string;
  arquivos: string;
  extensoes: string;
  data: string;
}

export interface GaArquivoGrupo {
  id: number;
  nome: string;

  loading?: boolean;
  selected?: boolean;
}
