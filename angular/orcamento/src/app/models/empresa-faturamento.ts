export interface EmpresaFaturamento {
  idFaturamentoCobranca: number;
  cnpj: string;
  nomeFantasia: string;
}

export type EmpresaFaturamentoTipo = 'direto' | 'refaturado' | 'revenda';
