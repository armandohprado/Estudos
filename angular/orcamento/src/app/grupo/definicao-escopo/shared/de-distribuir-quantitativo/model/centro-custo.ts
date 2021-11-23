export interface CentroCusto {
  idFase: number;
  idProjetoEdificioPavimento: number;
  dataCadastro: string;
  idProjetoCentroCusto: number;
  descricaoProjetoCentroCusto: string;
  quantidadeReferencia: number;
  idOrcamentoGrupoItemQuantitativo?: number;
  idOrcamentoGrupoItem?: number;
  cor?: string;
  ordem?: number;
  principal?: boolean;
  idProjeto?: number;
  ativo?: boolean;
  idPropostaItemQuantitativo?: number;
  idPropostaItem?: number;
  quantidadeOrcada?: number;
}
