import { GrupoItemDE } from '../model/grupo-item';
import { ErrorApi } from '../model/error-api';
import { Fornecedor } from '../../../models';

export interface DefinicaoEscopoStateModel {
  gruposItens: GrupoItemDE[];
  loading?: boolean;
  errorApi?: ErrorApi;
  mode?: DefinicaoEscopoModeEnum;
  fornecedores?: Fornecedor[];
  loadingFornecedores?: boolean;
  openingAll?: boolean;
}

export enum DefinicaoEscopoModeEnum {
  lista,
  inserir,
}
