import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';

export interface FamiliaGrupoOpcional {
  idOrcamentoCenarioFamilia: number;
  idOrcamentoFamilia: number;
  nomeFamilia: string;
  valorTotal: number;
  percentualTaxaAdministrativa: number;
  valorTaxaAdministrativa: number;
  comentarioTaxaAdministrativa?: any;
  taxaEmPercentual: boolean;
  isOpen?: boolean;
}

export interface FornecedorOpcional {
  idFornecedor: number;
  nomeFantasia: string;
}

export interface GrupoOpcional {
  idGrupo: number;
  idOrcamentoGrupo: number;
  idPlanilhaHibrida: number;
  idOrcamentoCenarioGrupoContrato: number;

  codigo: string;
  nome?: string;
  descricaoComplementarGrupo?: any;
  fornecedores: FornecedorOpcional[];
  comentarioDesconto: string;
  comentarioDescontoOportunidade: string;
  comentarioDescontoVPDNN: string;
  percentualDesconto: number;
  percentualDescontoVPDNN: number;
  percentualImposto: number;
  percentualMargemEmbutida: number;
  percentualOportunidade: number;
  percentualTaxaAdmFamilia: number;
  subTotal: number;
  subtotal1: number;
  valorDesconto: number;
  valorDescontoVPDNN: number;
  valorImposto: number;
  valorMargemEmbutida: number;
  valorOportunidade: number;
  valorOrcado: number;
  valorTotal: number;
  valorTotalVPDNN: number;
  valorTotalTransferido: number;
  valorTotalTransferidoCC: number;
  valorTransferencia: number;
  expand?: boolean;
  loading?: AwInputStatus;
  loadingComentarioDesconto?: boolean;
  hideBtnApplyDesconto?: boolean;
  hideBtnApplyMargem?: boolean;
  hideBtnApplyDescontoVPDNN?: boolean;
  hideLabelPercentualDesconto?: boolean;
  hideLabelPercentualMargem?: boolean;
  hideLabelPercentualDescontoVPDNN?: boolean;
  editComentarioDesconto?: boolean;
  editComentarioOportunidade?: boolean;
  labelPercentualDesconto: boolean;
  labelPercentualMargemEmbutida: boolean;
  labelPercentualOportunidade: boolean;
  labelPercentualDescontoVPDNN: boolean;
  grupoSemTaxa: boolean;
}

export interface GrupaoOpcional {
  idGrupao: number;
  descricaoGrupao: string;
  numeroGrupao: number;
  idOrcamentoCenarioFamilia: number;
  grupos: GrupoOpcional[];
}

export interface TaxasGruposOpcionais {
  valorTaxaAdministrativa: number;
  percentualTaxaAdministrativa: number;
  valorTaxaAdministrativaCenarioOpcional: number;
  percentualTaxaAdministrativaCenarioOpcional: number;
}
