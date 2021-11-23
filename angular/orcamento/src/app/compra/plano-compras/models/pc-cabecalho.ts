import { ConditionalKeys } from 'type-fest';

export interface PcCabecalho {
  valorTotalMetaCompra: number;
  valorTotalImpostoPrevistoDesenvolvimento: number;
  valorImpostoRefaturamento: number;
  valorTotalMetaMiscellaneous: number;
  valorOrcado: number;
  valorVendaCongelada: number;
  potencialLucroPrevisto: number;
  percentualImpostoPrevisto: number;
  valorVenda: number;
  idPlanoCompra: number;
  valorDescontoComercial: number;
  percentualDescontoComercial: number;
  percentualPotencialLucro: number;
  percentualTotalMetaCompra: number;
  percentualTotalImpostoPrevistoDesenvolvimento: number;
  percentualTotalMetaMiscellaneous: number;
  congelado: boolean;

  minified?: boolean;
}

export interface PcCabecalhoValor {
  title: string;
  value: number | string;
  hasPercent?: ConditionalKeys<PcCabecalho, number>;
  subValue?: number | string;
  subPercent?: ConditionalKeys<PcCabecalho, number>;
}
