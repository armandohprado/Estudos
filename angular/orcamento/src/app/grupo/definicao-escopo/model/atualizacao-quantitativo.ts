export interface InclusaoGrupoItemQuantitativo {
  idOrcamentoGrupoItemQuantitativo: number;
  idOrcamentoGrupoItem: number;
  idFase: number;
  idProjetoEdificioPavimento: number;
  idProjetoCentroCusto: number;
  quantidade: number;
  dataCadastro: string;

  projetoTecnico?: boolean;
  idOrcamentoGrupo?: number;
  idGrupo?: number;

  idOrcamentoGrupoItemAtualizados?: number[];
  atualizarRelacionados?: boolean;
}
