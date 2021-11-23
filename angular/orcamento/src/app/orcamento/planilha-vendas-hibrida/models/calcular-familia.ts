export interface CalcularFamilia {
  idOrcamentoCenarioFamilia: number;
  idOrcamentoCenario: number;
  fixoFinalProposta: boolean;
  valorDesconto: number;
  percentualDesconto: number;
  valorMargem: number;
  percentualMargem: number;
  valorTaxaAdm: number;
  percentualTaxaAdm: number;
  valorDescontoVPDNN: number;
  percentualDescontoVPDNN: number;
  valorTotalFamilia: number;
  comentarioTaxaAdministrativa: string;
  totalizadorOrcado: number;
  valorTotalTransferido: number;
  valorTotalTransferidoCC: number;

  totalizadorDesconto: number;
  totalizadorMargem: number;
  totalizadorImposto: number;
  totalizadorOportunidade: number;
  totalizadorDescontoVPDNN: number;
  totalizadorDescontoTotalVPDNN: number;
}
