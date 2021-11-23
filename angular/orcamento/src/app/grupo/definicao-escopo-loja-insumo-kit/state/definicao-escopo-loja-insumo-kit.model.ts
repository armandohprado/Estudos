import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { GrupoItemKit } from '../models/grupo-item';

export interface DefinicaoEscopoLojaInsumoKitStateModel {
  grupoItens?: GrupoItemKit[];
  loading?: boolean;
  errorApi?: ErrorApi;
  openingAll?: boolean;
}
