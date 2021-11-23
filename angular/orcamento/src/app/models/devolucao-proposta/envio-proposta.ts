export interface ResumoValores {
  idProposta: number;
  idFornecedor: number;
  nomeFantasia: string;
  principal: boolean;
  descontoProduto: number;
  descontoServico: number;
  qtdItensOrcados: number;
  qtdItens: number;
  valorTotalProduto: number;
  valorTotalProdutoSemDesconto: number;
  valorTotalServico: number;
  valorTotalServicoSemDesconto: number;
  valorTotal: number;
}

export interface EnvioProposta {
  idProposta: number;
  versaoProposta: number;
  cnpj: string;
  nomeFantasia: string;
  nomeResponsavelProposta: string;
  dataRetornoProposta: string;
  dataValidadeProposta: string;
  montagemInstalacaoInclusa: boolean;
  nomeLiderEquipe: string;
  quantidadeFuncionario: number;
  prazoMobilizacao: number;
  prazoExecucaoServico: number;
  adicionaisInclusos: boolean;
  resumoValores: ResumoValores[];
  itensNaoOrcados: any[];
  subfornecedoresExcedente: boolean;
  maximoSubfornecedor: boolean;
  subfornecedores: string[];
}
