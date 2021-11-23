import { Order } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { LousaConfirmacaoCompra } from './lousa-confirmacao-compra';

export type LousaGrupoCirculoClass = 'grey' | 'red' | 'green';

export interface LousaGrupo {
  idOrcamentoCenario: number;
  idCompraNegociacao: number;
  idCompraNegociacaoGrupo: number;
  idGrupo: number;
  idPlanoCompraGrupo: number;
  codigo: string;
  nome: string;
  valorMetaCompra: number;
  idOrcamentoCenarioGrupoContrato: number;
  tipoFaturamento: string;
  idResponsavelBatidaMartelo: number;
  responsavelBatidaMartelo: string;
  idResponsavelEscopo?: any;
  responsavelEscopo?: any;
  idResponsavelNegociacao: number;
  responsavelNegociacao: string;
  dataLimiteCC?: Date;
  confirmacaoCompras: LousaConfirmacaoCompra[];
  valorSaldo: number;

  circuloClass: string;

  verba: number;
  venda: number;
  valorSaldoContingencia: number;
  valorMiscellaneous: number;
  valorContratado: number;
}

export interface LousaSort {
  property: keyof LousaGrupo;
  ordem: Order;
}
