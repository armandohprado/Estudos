import { ItemFornecedor } from './item-fornecedor';

export interface Fornecedor {
  idFornecedor: number;
  cnpj: string;
  nomeFantasia: string;
  razaoSocial: string;
  idStatus: number;
  fornecedorInterno: boolean;
  indicadorAWReferencia?: any;
  indicadorAWEstimado: boolean;
  versaoProposta: number;
  idProposta: number;
  nomeResponsavelProposta: string;
  dataRetornoProposta: Date | string;
  dataValidadeProposta: Date | string;
  montagemInstalacaoInclusa: boolean;
  nomeLiderEquipe: string;
  quantidadeFuncionario: number;
  prazoMobilizacao: number;
  prazoExecucaoServico: number;
  valorTotalItens: number;
  quantidadeItens: number;
  quantidadeItensOrcado: number;
  ordenacao: number;
  ordenacaoDesc: string;
  editing: boolean;
  descontoReal?: number;
  descontoPercentual?: number;
  observacao?: string;
  itens: ItemFornecedor[];

  // somente visualização
  todosItensMarcados: boolean;
  lc: boolean;
  loader: boolean;
  variacaoPercentualTotal: number;
  excedeuReferenciaTotal: boolean;
}
