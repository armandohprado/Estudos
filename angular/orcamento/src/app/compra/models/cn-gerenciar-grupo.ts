import { trackByFactory } from '@aw-utils/track-by';

export interface CnGerenciarGrupo {
  idCompraNegociacaoGrupo: number;
  idGrupo: number;
  codigo: string;
  nome: string;
  numeracao?: string;
  ativo: boolean;
}

export const trackByCnGerenciarGrupo = trackByFactory<CnGerenciarGrupo>('idCompraNegociacaoGrupo');
