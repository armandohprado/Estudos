import { trackByFactory } from '@aw-utils/track-by';

export interface NaturezaProjeto {
  idNaturezaProjeto: number;
  descricao: string;
}

export const trackByNaturezaProjeto = trackByFactory<NaturezaProjeto>('idNaturezaProjeto');
