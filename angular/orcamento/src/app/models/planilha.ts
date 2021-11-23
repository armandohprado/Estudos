export interface Planilha {
  idCadernoPlanilha?: number;
  idCaderno: number;
  idCadernoPlanilhaModelo: number;
  nomePlanilha: string;
  exibeFamilia: boolean;
  exibeItemOrcamento: boolean; // Assim que o backend refatorar, essa propriedade se tornará 'exibeItem'
  exibeCodigoItem: boolean;
  exibeTipoFaturamento: boolean;
  exibeAgrupador: boolean;
  exibeGrupo: boolean;
  exibeAndar: boolean;
  exibeCentroCusto: boolean;
  exibeItem: boolean; // Assim que o backend refatorar, essa propriedade se tornará 'exibeItensOrcamento'
  exibeItemQuantidade: boolean;
  exibeItemFornecedor: boolean;
  exibeItemValorUnitario: boolean;
  exibeItemFaturamento: boolean;
  exibeItemAndar: boolean;
  idCadernoPlanilhaImposto: number;
  idCadernoPlanilhaTaxa: number;
  cadernoPlanilhaModelo?: CadernoPlanilhaModelo;
  cadernoPlanilhaImposto?: CadernoPlanilhaImposto;
  cadernoPlanilhaTaxa?: CadernoPlanilhaTaxa;
}

interface CadernoPlanilhaModelo {
  idCadernoPlanilhaModelo: number;
  nomeModelo: string;
}

interface CadernoPlanilhaImposto {
  idCadernoPlanilhaImposto: number;
  nomeImposto: string;
}

interface CadernoPlanilhaTaxa {
  idCadernoPlanilhaTaxa: number;
  nomeTaxa: string;
}
