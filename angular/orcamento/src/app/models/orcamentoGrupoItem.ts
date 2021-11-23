export interface OrcamentoGrupoItem {
  idOrcamentoGrupoItem: number;
  idOrcamentoGrupo: number;
  numeracaoGrupoItem: string;
  descricaoGrupoItem: string;
  valorUnitarioProdutoReferencia: number;
  valorUnitarioServicoReferencia: number;
  idUnidade: number;
  idGrupoItem: number;
  idOrcamentoGrupoItemPai: number;
  atributo1: string;
  atributo2: string;
  atributo3: string;
  atributo4: string;
  complemento: string;
  tag: string;
  orcamentoGrupoItemAtributos: [];
  orcamentoGrupoItemQuantitativos: [];
}
