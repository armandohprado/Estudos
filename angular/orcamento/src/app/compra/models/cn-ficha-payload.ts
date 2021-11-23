import { CnFornecedor } from './cn-fornecedor';

export interface CnFichaPayloadCompraNegociacaoGrupoFichaTipoAreaCausa {
  idCompraNegociacaoGrupoFichaTipo: number;
  idFichaCausa: number | null;
  idFichaArea: number | null;
}

export interface CnFichaPayloadCompraNegociacaoGrupoFichaArquivo {
  idUpload: number;
}

export interface CnFichaPayloadCompraNegociacaoGrupoFichaTransacao {
  idCompraNegociacaoGrupoOrigem: number;
  valor: number;
}

export interface CnFichaPayloadCompraNegociacaoGrupoFichaTransacaoCC {
  idConfirmacaoCompra: number;
  idConfirmacaoCompraItem: number;
  valorTransferido: number;
  valorOriginal: number;
}

export interface CnFichaPayload {
  idGrupo: number;
  idProjeto: number;
  idCompraNegociacaoGrupo: number;
  idOrcamentoGrupo: number;
  idFornecedor: number;
  detalhe: string;
  compraNegociacaoGrupoFichaTipoAreaCausa: CnFichaPayloadCompraNegociacaoGrupoFichaTipoAreaCausa[];
  compraNegociacaoGrupoFichaArquivo?: CnFichaPayloadCompraNegociacaoGrupoFichaArquivo[];
  compraNegociacaoGrupoFichaTransacao: CnFichaPayloadCompraNegociacaoGrupoFichaTransacao[];
  compraNegociacaoGrupoFichaTransacaoCC: CnFichaPayloadCompraNegociacaoGrupoFichaTransacaoCC[];
  idTipoFicha?: number;

  // Helpers
  fornecedor?: CnFornecedor;
}

export type CnFichaPayloadMapa = Omit<CnFichaPayload, 'idGrupo' | 'idProjeto'>;

export interface OrcamentoGrupoFichaTipoAreaCausa {
  idOrcamentoGrupoFichaTipo: number;
  idFichaCausa: number;
  idFichaArea: number;
}

export interface FornecedorFichaPayload {
  idGrupo: number;
  idProjeto: number;
  idOrcamentoGrupo: number;
  idFornecedor: number;
  detalhe: string;
  orcamentoGrupoFichaTipoAreaCausa: OrcamentoGrupoFichaTipoAreaCausa[];
  orcamentoGrupoFichaArquivo: CnFichaPayloadCompraNegociacaoGrupoFichaArquivo[];
}
