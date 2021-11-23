import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { GrupoItemDELI } from '../models/grupo-item';

export interface DefinicaoEscopoLojaInsumoStateModel {
  grupoItens?: GrupoItemDELI[];
  loading?: boolean;
  errorApi?: ErrorApi;
  openingAll?: boolean;
}
