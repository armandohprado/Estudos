import { GrupoItemDE } from './grupo-item';

export interface GrupoItemValoresTag
  extends Partial<
    Pick<
      GrupoItemDE,
      | 'tag'
      | 'valorUnitarioServicoReferencia'
      | 'valorUnitarioProdutoReferencia'
    >
  > {}
