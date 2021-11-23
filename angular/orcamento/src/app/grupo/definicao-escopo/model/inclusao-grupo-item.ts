import { UnidadeMedida } from '@aw-models/unidade-medida';

export interface InclusaoGrupoItem {
  idOrcamentoGrupoItem: number;
  idOrcamentoGrupo: number;
  numeracaoGrupoItem: string;
  descricaoGrupoItem: string;
  valorUnitarioProdutoReferencia: number;
  valorUnitarioServicoReferencia: number;
  idUnidade: number;
  idGrupoItem?: number;
  idOrcamentoGrupoItemPai: number;
  complemento: string;
  tag: string;
  orcamentoGrupoItemQuantitativo: OrcamentoGrupoItemQuantitativo[];
  UM?: UnidadeMedida;
  idGrupo?: number;
  quantidadeTotal?: number;
  classificacao?: number;
}

export interface OrcamentoGrupoItemQuantitativo {
  idOrcamentoGrupoItemQuantitativo: number;
  idOrcamentoGrupoItem: number;
  idFase: number;
  idProjetoEdificioPavimento: number;
  idProjetoCentroCusto: number;
  quantidade: number;
  dataCadastro: string;
}
