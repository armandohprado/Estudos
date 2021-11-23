export interface ChangeOrder {
  idOrcamentoChangeOrder: number;
  idOrcamentoGrupoClassificacao: number;
  idCenarioStatus: number;
  cenarioStatus: string;
  nome: string;
  descricao: string;
  dataFinalizacao: string;
  prazoValidade: number;
  destacarImpostos: boolean;
  omitirDetalhamento: boolean;
  valorImpostoRefaturamento: number;
  valorLucroPrevisto: number;
  percentualLucroPrevisto: number;
  valorTotalACobrar: number;
  congelado: boolean;
  revisao: number;
  idOrcamentoCenario: number;
  idRfi: number;
  descricaoRfi: string;
  identificador: number;
}

export interface ResponseCreateChangeOrder {
  codigo: number;
  idOrcamento: number;
  idOrcamentoCenario: number;
  idOrcamentoGrupoClassificacao: number;
  idOrcamentoChangeOrder?: number;
  nome: string;
}
