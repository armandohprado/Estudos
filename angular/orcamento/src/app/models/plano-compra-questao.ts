import { trackByFactory } from '@aw-utils/track-by';

export interface PlanoCompraQuestao {
  idPlanoCompraQuestao: number;
  descricao: string;
  resposta: boolean;
}

export interface PlanoCompraQuestaoPayload {
  idPlanoCompraQuestao: number;
  resposta: boolean;
}

export const trackByPlanoCompraQuestao = trackByFactory<PlanoCompraQuestao>('idPlanoCompraQuestao');
