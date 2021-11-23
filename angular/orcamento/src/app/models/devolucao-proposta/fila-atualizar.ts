import { AtualizarItem, AtualizarQuantitativo } from './atualizar-item';

export interface FilaAtualizarPayload {
  item: AtualizarItem;
  quantitativo?: AtualizarQuantitativo;
  id: number;
}
