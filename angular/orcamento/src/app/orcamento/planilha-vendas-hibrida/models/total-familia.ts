import { AwInputStatus } from '../../../aw-components/aw-input/aw-input.type';

export interface TotalFamilia {
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
  totalizadorDesconto: number;
  totalizadorPercentualDesconto: number;
  totalizadorMargem: number;
  totalizadorPercentualMargem: number;
  totalizadorSubTotal1: number;
  totalizadorSubTotal: number;
  totalizadorImposto: number;
  totalizadorPercentualImposto: number;
  totalizadorValorTotal: number;
  totalizadorOportunidade: number;
  totalizadorPercentualOportunidade: number;
  totalizadorDescontoVPDNN: number;
  totalizadorPercentualDescontoVPDNN: number;
  totalizadorDescontoTotalVPDNN: number;
  valorTotalTransferido?: number;
  valorTotalTransferidoCC?: number;

  loading?: AwInputStatus;
  hideBtnApplyDesconto?: boolean;
  hideBtnApplyMargem?: boolean;
  hideBtnApplyDescontoVPDNN?: boolean;
  hideLabelPercentualDesconto?: boolean;
  hideLabelPercentualMargem?: boolean;
  hideLabelPercentualDescontoVPDNN?: boolean;
}
