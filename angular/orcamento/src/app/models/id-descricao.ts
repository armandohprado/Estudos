import { trackByFactory } from '@aw-utils/track-by';

export interface IdDescricao {
  id: number;
  descricao: string;
}

export const trackByIdDescricao = trackByFactory<IdDescricao>('id');
