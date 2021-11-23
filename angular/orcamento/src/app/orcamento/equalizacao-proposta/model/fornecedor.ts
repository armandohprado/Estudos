import { EpPropostaItem } from './item';

export interface EpFornecedorBase {
  idFornecedor: number;
  indicadorAWReferencia: boolean;
  indicadorAWEstimado: boolean;
}

export interface EpFornecedor extends EpFornecedorBase {
  cnpj: string;
  nomeFantasia: string;
  razaoSocial: string;
  idStatus: number;
  fornecedorInterno: boolean;
  versaoProposta: number;
  idProposta: number;
  nomeResponsavelProposta?: string;
  dataRetornoProposta?: string;
  dataValidadeProposta?: string;
  montagemInstalacaoInclusa?: boolean;
  nomeLiderEquipe?: string;
  quantidadeFuncionario?: number;
  prazoMobilizacao?: string;
  prazoExecucaoServico?: string;
  nomeFornecedorAWE?: string;
  lc: boolean;
  valorTotalItens: number;
  quantidadeItens: number;
  quantidadeItensOrcado?: number;
  ordenacao: number;
  ordenacaoDesc: string;
  telefone?: string;

  selecionado: boolean;
  loadingLastCall: boolean;
  loadingEnvioCotacao: boolean;
  loadingTransferencia: boolean;
  loadingSelecionar: boolean;
}

export interface EpFornecedorResponse extends EpFornecedor {
  itens: EpPropostaItem[];
}

export interface EpFornecedorTotal {
  valorTotal: number;
  valorTotalParcial: number;
}
