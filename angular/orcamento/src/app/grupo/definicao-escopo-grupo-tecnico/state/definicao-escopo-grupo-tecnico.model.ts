import { ErrorApi } from '../../definicao-escopo/model/error-api';
import { GrupoItemTecnico } from '../models/grupo-item';

export interface DefinicaoEscopoGrupoTecnicoStateModel {
  grupoItens?: GrupoItemTecnico[];
  loading?: boolean;
  errorApi?: ErrorApi;
  openingAll?: boolean;
}
