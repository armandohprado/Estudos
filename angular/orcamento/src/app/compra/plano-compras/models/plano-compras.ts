import { PcFornecedor } from './pc-fornecedor';
import { PcResponsavel } from './pc-responsavel';
import { PcFaturamento } from './pc-faturamento';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { PcCabecalho } from './pc-cabecalho';
import { GenericResponse } from '../../../grupo/definicao-escopo/model/generic-response';
import { ErrorApi } from '../../../grupo/definicao-escopo/model/error-api';

export interface PlanoCompras {
  id?: string;

  idPlanoCompra: number;
  idPlanoCompraGrupo: number;
  idPlanilhaHibrida: number;
  idOrcamentoCenario: number;
  idOrcamentoGrupo: number;
  idGrupo: number;
  codigoGrupo: string;
  nomeGrupo: string;
  valorOrcadoDNN: number;
  grupoTaxa: boolean;
  fornecedorOrcadoDNN: string;
  desconto: number;
  comentarioDesconto: string;
  margemEmbutida: number;
  limiteCompra: number;
  faturamentoDNN: string;
  impostoDNN: number;
  valorTotalVenda: number;
  valorMetaMiscellaneous: number;
  percentualImposto: number;
  percentualMetaMiscellaneous: number;
  oportunidade: number;
  comentarioOportunidade: string;
  metaCompra: number;
  comentarioMetaCompra: string;
  dataPlanejamentoBatidaMartelo: Date;
  dataPlanejamentoEmissaoCC: Date;
  dataPlanejamentoInclusaoPO: Date;
  faturamentoDesenvolvimento: PcFaturamento;
  impostoDesenvolvimento: number;
  comentarioFornecedores: string;
  comentario: string;
  responsavelEscopo: PcResponsavel;
  responsavelNegociacao: PcResponsavel;
  responsavelBatidaMartelo: PcResponsavel;
  fornecedores: PcFornecedor[];
  fornecedoresDNN: PcFornecedor[];
  descontoVPDNN: number;

  loading?: boolean;
  statusProperty?: Partial<Record<KeyofPlanoCompras, AwInputStatus>>;
  errorApi?: Partial<Record<KeyofPlanoCompras, ErrorApi>>;
}

export type KeyofPlanoCompras = keyof PlanoCompras;

export interface PcValorMetaPayload {
  planoCompras: PcCabecalho;
  responseMessage: GenericResponse;
}

export interface PcFaturamentoPayload extends PcValorMetaPayload {
  valorImpostoDesenvolvimento: number;
}
export enum PcDatasPlanejamentoEnum {
  dataPlanejamentoBatidaMartelo = 0,
  dataPlanejamentoEmissaoCC,
  dataPlanejamentoInclusaoPO,
}
