export interface Cenario {
  idOrcamentoCenario: number;
  idOrcamento: number;
  nomeOrcamentoCenario: string;
  revisao: number;
  valorVenda: number;
  idOrcamentoCenarioOrigem: number;
  descricaoOrcamentoCenario: string;
  idCenarioStatus: number;
  nomeStatus: string;
  percentualBaseOrcamentoFornecedor: number;
  percentualBaseOrcamentoReferenciaAW: number;
  valorMargemContribuicao: number;
  valorImpostoRefaturamento: number;
  valorTotalComImposto: number;

  percentualImpostoRefautramento: number;
  percentualImpostoRefautramentoCliente: number;
  percentualMargemContribuicao: number;
}

export interface OrcamentoCenarioSimples {
  nomeOrcamentoCenario: string;
  idOrcamentoCenario: number;
}

export interface OrcamentoCenarioPadrao {
  dataRecebimentoTodosCustos?: Date;
  nomeOrcamento: string;
  nomeOrcamentoCenario: string;
  idOrcamentoCenario: number;
  nomeOrcamentoCenarioPadrao: string;
  idOrcamentoCenarioPadrao: number;
  idOrcamentoChangeOrder?: number;
  existePlanilhaCliente: boolean;
}

export enum CenarioStatusEnum {
  emEdicao = 1,
  analiseCEO = 2,
  aprovadoCEO = 3,
  analiseCliente = 4,
  propostaAprovada = 5,
  arquivados = 6,
  superados = 7,
  congelado = 8,
  reprovados = 9,
}

export interface CenarioStatusPayload {
  idCenarioStatus: number;
  nome: string;
  ordem?: number;
}
