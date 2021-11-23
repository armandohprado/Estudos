import { Familia } from './familia';

export interface Cenario {
  idOrcamentoCenario: number;
  idOrcamento: number;
  nomeOrcamentoCenario: string;
  percentualTaxaAdmBensServico: number;
  comentarioTaxaAdmBensServico: string;
  valorTaxaAdmistrativa: number;
  percentualTaxaAdministrativa: number;
  comentarioTaxaAdministrativa: string;
  congelado: true;
  orcamentoCenarioFamilia: OrcamentoCenarioFamilia[];
  revisao?: number;
  faturamentoAW?: number;
  faturamentoCliente?: number;
  lucroPrevisto?: number;
  imposto?: number;
  valorVenda?: number;
  idOrcamentoCenarioOrigem?: number;
  descricaoOrcamentoCenario?: string;
  percentualLucroPrevisto?: number;
  percentualImposto?: number;
  idCenarioStatus?: number;
  nomeStatus?: string;
  percentualBaseOrcamentoFornecedor?: number;
  percentualBaseOrcamentoReferenciaAW?: number;
  valorMargemContribuicao?: number;
  valorImpostoRefaturamento?: number;
  tipoTaxaAdministrativa: number;
  taxaEmPercentual: boolean;
}

export interface OrcamentoCenarioFamilia {
  idOrcamentoCenarioFamilia: number;
  idOrcamentoCenario: number;
  idOrcamentoFamilia: number;
  taxaDeclarada: number;
  taxaEmbutida: number;
  valorTotal: number;
  taxaEmPercentual: boolean;
  orcamentoFamilia: OrcamentoFamilia;

  isOpen?: boolean;
}

interface OrcamentoFamilia {
  idOrcamentoFamilia: number;
  nomeOrcamentoFamilia: string;
  ordemOrcamentoFamilia: number;
  idOrcamento: number;
  idFamilia: number;
  idFamiliaCustomizada: number;
  familia: Familia;
}

export interface CenarioSimples {
  idOrcamentoCenario: number;
  nome: string;
}
