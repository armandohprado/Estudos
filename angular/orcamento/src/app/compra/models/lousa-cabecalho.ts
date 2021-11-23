export interface LousaCabecalho {
  nome: string;
  totalFaturamentoDireto: number;
  totalMiscellaneous: number;
  totalRevenda: number;
  totalCustoCompra: number;
  totalEquipe: number;
  totalTaxa: number;
  totalCorrecaoObra: number;
  totalEncontroContas: number;
}

export type LousaCabecalhoValorKeys = keyof Omit<LousaCabecalho, 'nome'>;
