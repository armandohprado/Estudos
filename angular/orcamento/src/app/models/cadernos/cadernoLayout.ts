export interface CadernoLayout {
  idCadernoLayout: number;
  nome: string;
  modelo: string;
  imagem: string;

  checked?: boolean;
}

export interface CadernoLayoutPost {
  idCaderno: number;
  idCadernoLayout: number;
}

export interface CadernoPostJustificacao {
  idOrcamentoCenario: number;
  idOrcamento: number;
  nomeOrcamentoCenario: string;
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
  valorVenda?: any;
  idCenarioStatus: number;
  nomeStatus: string;
}

export interface CadernoResumoJustificacao {
  idOrcamentoCenarioEvidencia: number;
  idOrcamentoCenario: number;
  justificacao: string;
  bucket?: any;
  arquivo?: any;
  url?: any;
  nomeFuncionario: string;
  dataGeracao: Date;
  nomeOriginal: string;
}

export interface CadernoPostUpload {
  idOrcamentoCenarioEvidencia: number;
  idOrcamentoCenario: number;
  bucket: string;
  arquivo: string;
  url: string;
  dataGeracao: Date;
}
