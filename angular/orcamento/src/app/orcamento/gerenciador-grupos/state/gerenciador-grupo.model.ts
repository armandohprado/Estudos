export interface CenarioGG {
  nomeOrcamentoCenario: string;
  idOrcamentoCenario: number;
  idOrcamentoCenarioGrupo: number;
  idOrcamento: number;
  excluido: boolean;
  ativo: boolean;
  disabled: boolean;
  valorOrcado: number;
  opcional: boolean;
  revisao: number;
  revisaoCliente: number;
  percentualImpostoRefautramento: number;
  percentualImpostoRefautramentoCliente: number;
  percentualBaseOrcamentoReferenciaAW: number;
  percentualBaseOrcamentoFornecedor: number;
  valorMargemContribuicao: number;
  valorImpostoRefaturamento: number;
  idOrcamentoCenarioOrigem?: any;
  descricaoOrcamentoCenario?: any;
  valorTotalComImposto: number;
  valorVenda: number;
  idCenarioStatus: number;
  nomeStatus: string;
  codigoGrupo: string;
  nomeGrupo: string;
  tipoGrupoOpcional: TipoGrupoOpcionalEnum;

  idOrcamentoGrupo?: number;
}

export interface CenarioRetornoResponse {
  idOrcamentoCenarioGrupo: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenario: number;
  ativo: boolean;
  excluido: boolean;
  opcional: boolean;
  tipoGrupoOpcional: number;
  idOrcamentoCenarioGrupoVinculoOpcional?: number;
  nomeGrupo?: any;
  codigoGrupo?: any;
}

export interface CenarioRetorno {
  idOrcamentoCenarioGrupo: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenario: number;
  ativo: boolean;
  excluido: boolean;
  opcional: boolean;
  tipoGrupoOpcional: number;
}

export interface GrupoGG {
  idGrupo: number;
  idGrupao: number;
  codigoGrupo: string;
  nomeGrupo: string;
  descricaoComplementarGrupo: string;
  complementoOrcamentoGrupo: string;
  idOrcamentoGrupo: number;
  cenarios: CenarioGG[];
  idTipoGrupo: number;
  idOrcamentoFamilia: number;
  idOrcamentoGrupoOrigem: number;
  editandoComplemento?: boolean;
  loaderComplemento?: boolean;
  idFamiliaCustomizada: number | null;
  opcional?: boolean;
}

export interface FamiliaGG {
  idFamilia: number;
  idFamiliaCustomizada: number | null;
  idOrcamentoFamilia: number;
  descricaoFamilia: string;
  idOrcamento: number;
  grupos: GrupoGG[];
  orcamentoCenarioFamilias: CenarioFamiliaGG[];
  isCollapse?: boolean;
}

export interface CenarioFamiliaGG {
  idCenarioStatus: number;
  loaderAdcGrupo: boolean;
  loaderDuplicarGrupo: boolean;
  disabled: boolean;
  idOrcamentoFamilia: number;
  idOrcamentoCenario: number;
  idOrcamentoCenarioFamilia: number;
}

export enum TipoGrupoOpcionalEnum {
  troca,
  complemento,
  semVinculo,
}
export interface FamiliaGrupoOpc {
  idOrcamentoCenarioFamilia: number;
  nomeOrcamentoFamilia: string;
}
export interface GrupoOpc {
  idOrcamentoCenarioGrupo: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenario: number;
  nomeGrupo: string;
  codigo: string;
  numeroGrupao: string;
}

export interface GgGravarOpcionalResponse {
  idOrcamentoCenarioGrupo: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenario: number;
  ativo: boolean;
  excluido: boolean;
  opcional: boolean;
  tipoGrupoOpcional: number;
  idOrcamentoCenarioGrupoVinculoOpcional: number;
  nomeGrupo: string;
  codigoGrupo: string;
}
