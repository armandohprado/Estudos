import { Entity } from '@aw-utils/types/entity';

export interface GrupoItemPesquisaReferencia {
  confirmacoesCompraValorReferencia: ConfirmacaoCompraValorReferencia[];
  projetos: Projeto[];
  atributoAtivo: Entity<boolean>;
}

export interface ConfirmacaoCompraValorReferencia {
  idConfirmacaoCompraValorReferencia: number;
  idProjeto: number;
  nomeProjeto: string;
  nomeFantasia: string;
  quantidadeTotal: null;
  idGrupo: number;
  idGrupoClassificacao: number;
  idConfirmacaoCompra: number;
  dataConfirmacaoCompra: string;
  itemConfirmacaoCompraValorUnitarioProduto: number;
  itemConfirmacaoCompraValorUnitarioServico: number;
  valorTotal: number;
  descricaoGrupoItem: string;
  atributo1: string;
  atributo2: string;
  atributo3: string;
  atributo4: string;
}

export interface Projeto {
  idProjeto: number;
  nomeProjeto: string;
}

export interface GrupoItemPesquisaReferenciaPayload {
  idOrcamentoGrupoItem: number;
  idProjeto: number;
  periodoPesquisa: number;
  pesquisarPorAtributosInformados: boolean;
  atributo1?: string;
  atributo2?: string;
  atributo3?: string;
  atributo4?: string;
}
